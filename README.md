## Inputs

Add a step like this to your workflow:

```yml
- uses: metro420yt/class-update@v1-rc
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

## Examples
<details>

<summary><h3>When <a href="https://raw.githubusercontent.com/SyndiShanX/Update-Classes/main/Changes.txt">SyndiShanX's Changes.txt</a> updates</h3></summary>

> <a href="https://github.com/Metro420yt/Discord-comfy/blob/master/.github/workflows/classUpdate.yml" style="color: #919894">🔗 this is a workflow i use for a fork</a>

```yml
name: Update Classes

on:
  workflow_dispatch: # manually trigger
  repository_dispatch: # trigger by webhook (example below)
    types: [update_class] # id for webhook to target

jobs:
  classUpdate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - id: update
        uses: metro420yt/class-update@v1-rc
        with:
          folder: stuff
          ext: scss

      - uses: gha-utilities/sass-build@v0.6.0 #compile scss files
        if: ${{steps.update.outputs.totalChanges > 0}} #skip if no class changes
        with:
          source: ./app.scss
          destination: ./betterdiscord/main.css
          outputStyle: expanded
      - uses: EndBug/add-and-commit@v9
        if: ${{steps.update.outputs.totalChanges > 0}} #skip if no class changes
        with:
          default_author: github_actions
          message: "chore: update classes"
          fetch: true
```


im using [make.com](https://make.com) since they have a free tier, but this can be without them if needed

[make.com blueprint](https://gist.github.com/Metro420yt/a3cc2687adb2313966c2f339bd43d246#file-make-blueprint-json)
> make sure to set up a schedule, i wouldnt try and make it run more than once per hour to stay under the 1000 operations/month
</details>

<br>


- using an rss feed parser, have it check [this feed](https://github.com/SyndiShanX/Update-Classes/commits/main/Changes.txt.atom) for new items (commits)
- when a new commit is made, send a POST request to `https://api.github.com/repos/<YOUR_REPO>/dispatches` with this info ([docs](https://docs.github.com/en/webhooks/webhook-events-and-payloads#repository_dispatch))
  - headers:
    - Accept: application/vnd.github+json <sub>(might not need, idk)</sub>
    - Content-Type: application/json
    - Authorization: `Bearer <YOUR_TOKEN>` (see [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#about-personal-access-tokens))
  - body:
    - `{"event_type": "<YOUR_DISPATCH_ID>"}`



---
## Credits
>- inspired by [ClassUpdate from Saltssaumure](https://github.com/Saltssaumure/ClassUpdate)
>- changelist maintained by [SyndiShanX](https://github.com/SyndiShanX) ([repo](https://github.com/SyndiShanX/Update-Classes))
>- class name history maintained by [itmesarah](https://github.com/itmesarah) ([repo](itmesarah))
>- README.md based on [EndBug/add-and-commit](https://github.com/EndBug/add-and-commit/blob/v9/README.md)