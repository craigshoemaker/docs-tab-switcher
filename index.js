const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const config = require('./config').read();

const UTF8_ENCODING = 'utf8';

const _module = {

    keys: {
        list: [],
        first: '',
        second: ''
    },

    init: () => {
        if (!config.tabOrder || !config.folderPath) {
            console.log('Please fill out the config.json file.');
            return;
        } else {
            console.log(`Reading files from: ${config.folderPath}`);
            console.log(`Reordering tabs to: ${config.tabOrder}`);
            _module.keys.list = config.tabOrder.replace(/ /g, '').split(',');
            _module.keys.first = _module.keys.list[0];
            _module.keys.second = _module.keys.list[1];
        }
    },

    getAllFilesInFolder: async (folderPath) => await readdir(folderPath),

    readFile: async (filePath) => await readFile(filePath, UTF8_ENCODING),

    filterToOnlyMarkdownFiles: (files) => files.filter(file => path.extname(file) === '.md'),

    reorderTabs: async (folderPath) => {

        try {

            const files = await _module.getAllFilesInFolder(folderPath);
            const markdownFiles = _module.filterToOnlyMarkdownFiles(files);
    
            for (const file of markdownFiles) {
                
                const filePath = path.join(folderPath, file);
                
                let content = await _module.readFile(filePath);

                const tabSetsPattern = new RegExp(`#+ \\[.*\\]\\(#tab/${_module.keys.second}\\)(\[\\s\\S\]*?)---`, 'gm');
                const tabSets = content.match(tabSetsPattern);

                if(tabSets && Array.isArray(tabSets)) {

                    tabSets.forEach(tabSection => {

                        // Remove ending delimiter just so we're only working
                        // with the tab content exclusively. We'll add it back 
                        // in later.
                        let allTabs = tabSection.replace('---', '');

                        const tabDelimiters = allTabs.match(/#+ \[.*\]\(#tab\/.*\)/g);
                        let tabContents = allTabs.split(/#+ \[.*\]\(#tab\/.*\)/).filter(Boolean); // <-- removes empty elements
                        
                        const tabContent = {};
                        const tabKeys = _module.keys.list;

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
                            }
                        });

                        let reorderedTabs = [];

                        tabKeys.forEach(key => {
                            reorderedTabs.push(tabContent[key]);
                        });

                        reorderedTabs.push('---');

                        let updatedTabs = reorderedTabs.join('');
                        updatedTabs = updatedTabs.replace(/\s*[\r\n]/gm, '\r\n\r\n'); // strip extra line breaks

                        content = content.replace(tabSection, updatedTabs);
                    });

                }

                await writeFile(filePath, content, UTF8_ENCODING);

                console.log(`Updated: ${filePath}`);
            }

        } catch (error) {
            console.error('Error reading the markdown files:', error);
        }
    }
};

_module.init();
_module.reorderTabs(config.folderPath);