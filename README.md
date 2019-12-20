# xycode README

[xycode](https://github.com/exiahuang/Xycode) is a lightweight command executor for vscode.

If you want to build a vscode extension, maybe you can use `xycode` first.

[Document](https://exiahuang.github.io/xycode-doc/)

[xycode-config](https://github.com/exiahuang/Xycode-config)

## Features

- [x]  Less than 100k.
- [x]  Shared configuration (tasks/settings) of VScode.
- [x]  Integrated with system command and work with vscode.
- [x]  Support c lang.
- [x]  Support vbs.
- [x]  Support dotnet core.
- [x]  Support go language.
- [x]  Support python.
- [x]  Support ruby.
- [x]  Support gradle language.
- [x]  Support npm/nodejs/express/vue.
- [x]  Support prettier, format source automatically.
- [x]  Support Heroku development.
- [x]  Support git command.
- [x]  Support sfdx, it is a Rapid development tool for Salesforce SFDX Development.
- [x]  Support Wenyan 文言文編程語言.
- [x]  Support hexo/mkdoc blog.
- [ ]  TODO : jekyll .
- [ ]  TODO :  Docker development.
- [ ]  TODO : a calculator.

## Download config

### Download in Vscode

run `xycode: download config`, and select config file.

### Manually Download

Please download config From [xycode-config](https://github.com/exiahuang/Xycode-config).
And copy the configs to Home directory( `~/.xycode` or `%USERPROFILE%/.xycode`)

## Custom Config

### create json file

create json file in below
Windows user: `%USERPROFILE%/.xycode`
Linux/Mac user: `~/.xycode`

### json data construct

```json
{
    "tasks": [
        {
            "label": "label name, required",
            "description": "description, not required",
            "command": "your command, required",
            // cwd is not required
            "cwd": "path of current working directory",
            // filetypes is not required
            // "filetypes": [".py"],
            // if you not need the command , please set it true
            // "inActive": false,
            // show the message in termial, default show in channel.
            // "termial": { name?: string, shellPath?: string, shellArgs?: string[] | string };
            // before run the command, you can set some check.
            "beforeTriggers": [
                {
                    "type": "buildin",
                    "fn": "CheckFileExist",
                    "params": ["${project_directory}/${project_name}"]
                }
            ],
            // after ran the command, you can do something.
            "afterTriggers": [
                {
                    "type": "buildin",
                    "fn": "SwitchFolder",
                    "params": ["${project_directory}/${project_name}"]
                }
            ]
        }
    ],
    "variables": {
        "apex_template": {
            "label": "sfdc apex template",
            "description": "",
            "value": [
                "DefaultApexClass",
                "ApexException",
                "ApexUnitTest",
                "InboundEmailService"
            ]
        },
        "base_metadata": {
            "label": "default sfdc metadata",
            "description": "",
            "value": "ApexClass, ApexPage, ApexComponent, ApexTrigger"
        }
    }
}
```

### Predefined variables

-   \${HOME} - Home directory
-   \${file} - the current opened file
-   \${fileBasename} - the current opened file's basename
-   \${fileBasenameNoExtension} - the current opened file's basename with no file extension
-   \${workspaceFolder} - the path of the folder opened
-   \${workspaceFolderBasename} - the name of the folder opened in Sublime without any slashes (/)
-   \${fileDirname} - the current opened file's dirname
-   \${fileExtname} - the current opened file's extension
-   \${YYYYMMDD} - current date
-   \${YYYYMMDD_HHmm} - current datetime

### Predefined trigger

-   Mkdirs - make directory
-   SwitchFolder - switch project folder
-   OpenFile - open file
-   CheckFileExist - check file exist
-   Diff - diff file

### friendly user interface

-   input - Custom Input String
-   select - Select List
-   multiselect - Multiple Select List
-   openFolderDailog - Folder Path Selector
-   singleFileDailog - File Path Selector
-   multiFilesDailog - Mutliple File Paths Selector

## config example

### example 1: input

echo user input

```json
{
    "tasks": [
        {
            "label": "hello:echo:user-input",
            "description": "echo user input",
            "command": "echo ${input:project_directory}"
        }
    ],
    "variables": {}
}
```

if you want to set the default value, please define the variable:

```json
{
    "tasks": [
        {
            "label": "hello:echo:user-input",
            "description": "echo user input",
            "command": "echo ${input:project_directory}"
        }
    ],
    "variables": {
        "project_directory": {
            "label": "project directory",
            "value": "${HOME}/test-project"
        }
    }
}
```

### example 2: select

echo user select

```json
{
    "tasks": [
        {
            "label": "hello:echo:user-select",
            "description": "echo user select",
            "command": "echo ${select:dotnet_template}"
        }
    ],
    "variables": {
        "dotnet_template": {
            "label": "dotnet core template",
            "value": [
                "console",
                "classlib",
                "wpf",
                "wpflib",
                "wpfcustomcontrollib",
                "wpfusercontrollib",
                "winforms"
            ]
        }
    }
}
```

### example 3: multiselect

echo files path, you can use `separator` to control the result string.

```json
{
    "tasks": [
        {
            "label": "hello:echo:multiselect",
            "description": "echo user multiselect",
            "command": "echo ${multiselect:METADATA}"
        }
    ],
    "variables": {
        "METADATA": {
            "label": "sfdc metadata",
            "separator": ",",
            "value": [
                "ApexClass",
                "ApexComponent",
                "ApexPage",
                "ApexTestSuite",
                "ApexTrigger"
            ]
        }
    }
}
```

### example 4: openFolderDailog

echo directory path

```json
{
    "tasks": [
        {
            "label": "hello:echo:folder-path",
            "description": "echo directory",
            "command": "echo ${openFolderDailog:project_directory}"
        }
    ],
    "variables": {}
}
```

### example 5: singleFileDailog

single file dailog, you can use `filters` to control the file type.

```json
{
    "tasks": [
        {
            "label": "hello:echo:file-path",
            "description": "echo single file path",
            "command": "echo ${singleFileDailog:package_xml}"
        }
    ],
    "variables": {
        "package_xml": {
            "label": "sfdc package.xml path",
            "filters": { "package.xml": ["xml"] },
            "value": "./manifest/package.xml"
        }
    }
}
```

### example 6: multiFilesDailog

Mutliple File Paths Selector

-   use `filters` to control the file type.
-   use `separator` to control the result string.

```json
{
    "tasks": [
        {
            "label": "hello:echo:files-paths",
            "description": "echo files paths",
            "command": "echo ${multiFilesDailog:sfdcsourcesfiles}"
        }
    ],
    "variables": {
        "sfdcsourcesfiles": {
            "label": "sfdc sources files",
            "separator": ",",
            "value": ""
        }
    }
}
```

### example 7: run command in wsl

change the shellPath, you can run command in wsl/bash/powershell ... or other termial

```json
{
    "label": "run command in wsl",
    "termial": {
        "name": "xycode",
        "shellPath": "wsl.exe"
    },
    "command": "pwd"
}
```

### example 8: auto formatter and auto runner

After you save file in vscode,
It will use `yapf` to format code and run python code automatically.

```json
{
    "tasks": [],
    "variables": {},
    "onSaveEvents": [
        {
            "label": "format python code",
            "description": "format python code",
            "filetypes": [".py"],
            "inActive": false,
            "command": "yapf \"${file}\" --style \"google\" -i"
        },
        {
            "label": "run python file",
            "description": "run python file",
            "filetypes": [".py"],
            "inActive": false,
            "cwd": "${fileDirname}",
            "command": "python \"${file}\""
        }
    ]
}
```

### example 10: user prettier to format source code.

use `Prettier` to pretty code .

```json
{
    "tasks": [],
    "variables": {},
    "onSaveEvents": [
        {
            "label": "pretty code.",
            "description": "Prettier is an opinionated code formatter.",
            "filetypes": [".json", ".javascript", ".js", ".md", ".css", ".vue"],
            "inActive": false,
            "cwd": "${fileDirname}",
            "command": "prettier --write \"${file}\" --single-quote=true --end-of-line=lf --arrow-parens=always --tab-width=4"
        }
    ]
}
```

## Shortkey

shortkey: `ctrl+shift+i`

## Requirements

None.

## Extension Settings

This extension contributes the following settings:

-   `xycode.maxBuffer`: The maxBuffer option specifies the largest number of bytes allowed on stdout or stderr.

## Known Issues

None

## Release Notes

Release Notes:

### 1.0.0

Initial release of Xycode.

**Enjoy it!**