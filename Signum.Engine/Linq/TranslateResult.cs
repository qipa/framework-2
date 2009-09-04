﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Linq.Expressions;
using System.Data.SqlClient;
using System.Data;

namespace Signum.Engine.Linq
{
    interface ITranslateResult
    {
        Type ElementType { get; }
        string CommandText { get; }
        UniqueFunction? Unique { get; }
        bool HasFullObjects { get; }

        object Execute(IProjectionRow pr); 
    }

    class TranslateResult<T> : ITranslateResult
    {
        public string CommandText { get; set; }
        public UniqueFunction? Unique { get; set; }
        public bool HasFullObjects { get; set; }
        public Type ElementType { get { return typeof(T); } }

        internal Expression<Func<IProjectionRow, SqlParameter[]>> GetParametersExpression;
        internal Func<IProjectionRow, SqlParameter[]> GetParameters;
        internal Expression<Func<IProjectionRow, T>> ProjectorExpression;
     
        internal string Alias;

        public object Execute(IProjectionRow pr)
        {
            SqlPreCommandSimple command = new SqlPreCommandSimple(CommandText, GetParameters(pr).ToList());

            DataTable dt = Executor.ExecuteDataTable(command);

            ProjectionRowEnumerator<T> enumerator = new ProjectionRowEnumerator<T>(dt, ProjectorExpression, HasFullObjects, pr, Alias);

            IEnumerable<T> reader = new ProjectionRowEnumerable<T>(enumerator);

            if (Unique.HasValue)
                switch (Unique.Value)
                {
                    case UniqueFunction.First: return reader.First();
                    case UniqueFunction.FirstOrDefault: return reader.FirstOrDefault();
                    case UniqueFunction.Single: return reader.Single();
                    case UniqueFunction.SingleOrDefault: return reader.SingleOrDefault();
                    default:
                        throw new InvalidOperationException();
                }
            else
                if (HasFullObjects || pr != null)
                    return reader.ToList();
                else
                    return reader;
        }
    }
}
