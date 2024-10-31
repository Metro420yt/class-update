# Class Updater
- [Class Updater](#class-updater)
- [Usage](#usage)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Credits](#credits)


# Usage
## Inputs

Add a step like this to your workflow:

```yml
- uses: metro420yt/class-update@v1
  with:
    # folder that has your theme files
    # Default: themes
    folder: 'src'

    # file extension to target
    # Default: css
    ext: scss

    # url or relative path to a file containing an old&new pair of class names
    # Default: https://raw.githubusercontent.com/SyndiShanX/Update-Classes/main/Changes.txt
    diff: './changes.txt'
```


## Outputs

The action provides these outputs:

- `totalChanges`: the total number of classes that were replaced

> For more info on how to use outputs, see ["Context and expression syntax"](https://docs.github.com/en/free-pro-team@latest/actions/reference/context-and-expression-syntax-for-github-actions).



---
## Credits
<div style="color:gray">
<p>inspired by <a href="https://github.com/Saltssaumure/ClassUpdate">ClassUpdate from Saltssaumure</a></p>
<p>README.md based on <a href="https://github.com/EndBug/add-and-commit/blob/v9/README.md">EndBug/add-and-commit</a></p>
</div>