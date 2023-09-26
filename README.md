# Docs Tab Switcher

Need to switch the order of conceptual tabs in a Microsoft Docs article?

The Docs Tab Switcher scans a folder for Markdown files and reorders tab groups into your desired order.

> Watch a [short demo video](https://youtu.be/LNglYMhmboo?feature=shared) to get started.

## Usage

First, edit the *config.json* file and update the following properties:

| Property | Description |
|---|---|
| `folderPath` | The folder path that holds your Markdown files |
| `tabOrder` | List your desired order of the tabs in the article. Add the tab IDs in a comma separated list.  |

```
{
  "folderPath": "C:\\Users\\cshoe\\azure-functions",
  "tabOrder": "python-v1,python-v2"
}
```

Now you can run the script to transform your files:

```
node index.js
```

## Considerations

Keep the following issues in mind when using Docs Tab Switcher:

+ The tool runs on all files in the folder specified in the config.js file. 
+ The tool isn't designed to handle nested tabs. However, in nested tabs keep in mind that only the inner _dependent_ tab in the pair is visible. The tab order of the outer _conditional_ tab doesn't matter. For example, in the tab definition, `[Inner tab](#tab/outer-tab/inner-tab)` only the `inner-tab` set is visible and the order of `outer-tab` can't be determined by users. For more information about nested tabs, see the [Tab syntax](https://review.learn.microsoft.com/help/platform/validation-ref/tabbed-conceptual?branch=main#tab-syntax). 
+ Having individual tabs commented out in markdown using `<!--- -->` may cause incorrect results. 
+ Always run the tool on the largest tab group that contains your tabs. For example, run using the definition `"tabOrder": "tab-1,tab-2,tab-3"` instead of just `"tabOrder": "tab-1,tab-2"` 