const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const config = require('./config').read();

const _module = {

    tabKeys: [],

    init: () => {
        if (!config.tabOrder || !config.folderPath) {
            console.log('Please fill out the config.json file.');
            return;
        } else {
            console.log(`Reading files from: ${config.folderPath}`);
            console.log(`Reordering tabs to: ${config.tabOrder}`);
            _module.tabKeys = config.tabOrder.replace(/ /g, '').split(',')
        }
    },

    getAllFilesInFolder: async (folderPath) => await readdir(folderPath),

    readFile: async (filePath) => await readFile(filePath, 'utf8'),

    filterToOnlyMarkdownFiles: (files) => files.filter(file => path.extname(file) === '.md'),

    reorderTabs: async (folderPath) => {

        try {

            const files = await _module.getAllFilesInFolder(folderPath);
            const markdownFiles = _module.filterToOnlyMarkdownFiles(files);
    
            for (const file of markdownFiles) {
                
                const filePath = path.join(folderPath, file);
                
                let content = await _module.readFile(filePath);

                const tabSets = content.match(/#+ \[.*\]\(#tab\/.*\)([\s\S]*?)---/gm);
                tabSets.forEach(tabSection => {

                    // Remove ending delimiter just so we're only working
                    // with the tab content exclusively. We'll add it back 
                    // in later.
                    let allTabs = tabSection.replace('---', '');

                    const tabDelimiters = allTabs.match(/#+ \[.*\]\(#tab\/.*\)/g);
                    let tabContents = allTabs.split(/#+ \[.*\]\(#tab\/.*\)/).filter(Boolean); // <-- removes empty elements
                    
                    const tabContent = {};
                    const tabKeys = _module.tabKeys;

                    tabDelimiters.forEach((delimiter, i) => {

                        let key = null;
                        for(let x = 0; x < tabKeys.length; x++) {
                            if(delimiter.match(new RegExp(`${tabKeys[x]}`))){ // find the delimiter that matches the key defined in the config file
                                key = tabKeys[x];
                                break;
                            }
                        }

                        if(key) {
                            tabContent[key] = `${delimiter}\n\n${tabContents[i]}`;
                        } else {
                            throw new Error(`Can't match tabs in the configuration file with what's in the article.`);
                        }
                    });

                    let reorderedTabs = [];

                    tabKeys.forEach(key => {
                        reorderedTabs.push(tabContent[key]);
                    });

                    reorderedTabs.push('---');

                    content = content.replace(tabSection, reorderedTabs.join(''));

                    writeFile(filePath, content, 'utf-8');
                });
            }

        } catch (error) {
            console.error('Error reading the markdown files:', error);
        }
    }
};

_module.init();
_module.reorderTabs(config.folderPath);