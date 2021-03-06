using Signum.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Signum.Engine.CodeGeneration
{
    public class ReactHookConverter
    {
        public void ConvertFilesToHooks()
        {
            while (true)
            {
                IEnumerable<string>? files = GetFiles();

                if (files == null)
                    return;

                foreach (var file in files)
                {
                    Console.Write(file + "...");

                    var content = File.ReadAllText(file);

                    var converted = SimplifyFile(content);

                    File.WriteAllText(file, converted);
                }
            }
        }

        public virtual IEnumerable<string>? GetFiles()
        {
            string folder = GetFolder();

            var files = Directory.EnumerateFiles(folder, "*.tsx", SearchOption.AllDirectories);

            return SelectFiles(folder, files);
        }

        public virtual string GetFolder()
        {
            CodeGenerator.GetSolutionInfo(out var solutionFolder, out var solutionName);

            var folder = $@"{solutionFolder}\{solutionName}.React\App";
            return folder;
        }

        public virtual IEnumerable<string>? SelectFiles(string folder, IEnumerable<string> files)
        {
            var result = files.Select(a => a.After(folder)).ChooseConsoleMultiple();

            if (result == null)
                return null;

            return result.Select(a => folder + a);
        }

        public virtual string SimplifyFile(string content)
        {
            HashSet<string> hookImports = new HashSet<string>();


            var componentStarts = Regex.Matches(content, @"^(?<export>export )?(?<default>default )?class (?<className>\w+) extends React\.Component<(?<props>.*?)>\s*{\s*\r\n", RegexOptions.Multiline).Cast<Match>();

            foreach (var m in componentStarts.Reverse())
            {
                var endMatch = new Regex(@"^}\s*$", RegexOptions.Multiline).Match(content, m.EndIndex());

                var simplifiedContent = SimplifyClass(content.Substring(m.EndIndex(), endMatch.Index - m.EndIndex()), hookImports);

                string newComponent = m.Groups["export"].Value + m.Groups["default"].Value + "function " + m.Groups["className"].Value + "(p : " + m.Groups["props"].Value + "){\r\n"
                     + simplifiedContent
                     + endMatch.Value;


                content = content.Substring(0, m.Index) + newComponent + content.Substring(endMatch.EndIndex());
            }


            if (hookImports.Any())
            {
                var lastImport = Regex.Matches(content, "^import.*\r\n", RegexOptions.Multiline).Cast<Match>().Last();

                return content.Substring(0, lastImport.EndIndex()) +
                    $"import {{ {hookImports.ToString(", ")} }} from '@framework/Hooks'\r\n" +
                    content.Substring(lastImport.EndIndex());
            }
            else
            {

                return content;
            }
        }

        public virtual string SimplifyClass(string content, HashSet<string> hookImports)
        {
            HashSet<string> hooks = new HashSet<string>();

            var matches = Regex.Matches(content, @"^  (?<text>\w.+)\s*\r\n", RegexOptions.Multiline).Cast<Match>().ToList();
            var endMatch = new Regex(@"^  };?\s*$", RegexOptions.Multiline).Matches(content).Cast<Match>().ToList();

            var pairs = matches.Select(m => new { isStart = true, m })
                .Concat(endMatch.Select(m => new { isStart = false, m }))
                .OrderBy(p => p.m!.Index)
                .BiSelectC((start, end) => (start: start!, end: end!))
                .Where(a => a.start.isStart && !a.end.isStart)
                .Select(a => (start: a.start.m, end: a.end.m))
                .ToList();

            string? render = null;

            foreach (var p in pairs.AsEnumerable().Reverse())
            {
                var methodContent = content.Substring(p.start.EndIndex(), p.end.Index - p.start.EndIndex());

                var simplifiedContent = SimplifyMethod(methodContent, hooks, hookImports);

                if (p.start.Value.Contains("render()"))
                {
                    render = simplifiedContent.Lines().Select(l => l.StartsWith("  ") ? l.Substring(2) : l).ToString("\r\n");

                    content = content.Substring(0, p.start.Index) + content.Substring(p.end.EndIndex());
                }
                else
                {
                    string newComponent = ConvertToFunction(p.start.Value) + simplifiedContent + p.end.Value;

                    content = content.Substring(0, p.start.Index) + newComponent + content.Substring(p.end.EndIndex());
                }
            }

            return hooks.ToString(s => s + ";\r\n", "").Indent(2) + content + render;

        }

        public virtual string ConvertToFunction(string value)
        {
            {
                var lambda = Regex.Match(value, @"(?<ident> *)(?<name>\w+) *= *\((?<params>.*)\) *=> *{");
                if (lambda.Success)
                    return $"{lambda.Groups["ident"].Value}function {lambda.Groups["name"].Value}({lambda.Groups["params"].Value}) {{\r\n";
            }

            {
                var method = Regex.Match(value, @"(?<ident> *)(?<name>\w+) *\((?<params>.*)\) *{");
                if (method.Success)
                    return $"{method.Groups["ident"].Value}function {method.Groups["name"].Value}({method.Groups["params"].Value}) {{\r\n";
            }
            return value;
        }

        public virtual string SimplifyMethod(string methodBody, HashSet<string> hooks, HashSet<string> hooksImports)
        {
            methodBody = methodBody.Replace("this.props", "p");

            if(methodBody.Contains("this.forceUpdate"))
            {
                hooksImports.Add("useForceUpdate");
                hooks.Add("const forceUpdate = useForceUpdate()");
                methodBody = methodBody.Replace("this.forceUpdate", "forceUpdate");
            }
            methodBody = methodBody.Replace("this.state.", "");
            methodBody = methodBody.Replace("this.", "");

            return methodBody;
        }
    }
}
