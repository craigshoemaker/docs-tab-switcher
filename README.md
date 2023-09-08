# Docs Tab Switcher

Need to switch the order of conceptual tabs in a Microsoft Docs article?

The Docs Tab Switcher scans a folder for Markdown files and reorders tab groups into your desired order.

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
