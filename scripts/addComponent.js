const conf = require('../package.json');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

let newCpt = {};

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


let getCptName = () => {
    return new Promise((resolve, reject) => {
        rl.question('组件英文名(每个单词的首字母都大写，如TextBox):', (answer) => {
            newCpt.name = answer;
            resolve();
        });
    });
};

let getChnName = () => {
    return new Promise((resolve, reject) => {
        rl.question('组件中文名(十个字以内):', (answer) => {
            newCpt.chnName = answer;
            resolve();
        });
    });
};

let getType = () => {
    return new Promise((resolve, reject) => {
        rl.question('组件类型(component/filter/directive/method):', (answer) => {
            newCpt.type = answer || 'component';
            resolve();
        });
    });
};

function init() {
    getCptName().then(() => {
        return getChnName();
    }).then(() => {
        return getType();
    }).then(() => {
        createNew();
    });
}

function createIndexJs() {
    if (newCpt.type == 'method') return;
    return new Promise((resolve, reject) => {
        const nameLc = newCpt.name.toLowerCase();
        let content = `import ${newCpt.name} from './src/${nameLc}.vue';

${newCpt.name}.install = function(Vue) {
  Vue.${newCpt.type}(${newCpt.name}.name, ${newCpt.name});
};

export default ${newCpt.name}`;
        let content2 = `${newCpt.name}.install = function(Vue) {
Vue.${newCpt.type}(${newCpt.name}.name, ${newCpt.name});
};

export default ${newCpt.name}`;

        const dirPath = path.join(__dirname, `../src/package/${nameLc}/`);
        const filePath = path.join(dirPath, `index.js`);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        if (newCpt.type == 'filter' || newCpt.type == 'directive'){
            content = content2;
        }
        fs.writeFile(filePath,  content, (err) => {
            if (err) throw err;
            resolve(`生成index.js文件成功`);
        });
    });
}

function createVue() {
    return new Promise((resolve, reject) => {
        const nameLc = newCpt.name.toLowerCase();
        let content = `<template>
    <div class="nut-${nameLc}"></div>
</template>
<script>
export default {
    name:'nut-${nameLc}',
    props: {
    },
    data() {
        return {};
    },
    methods: {
    }
}
</script>
<style lang="scss">
</style>`;
        const dirPath = path.join(__dirname, `../src/package/${nameLc}/src/`);
        const filePath = path.join(dirPath, `${nameLc}.vue`);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        fs.writeFile(filePath, content, (err) => {
            if (err) throw err;
            resolve(`生成${newCpt.name}.vue文件成功`);
        });
    });
}

function createView() {
    return new Promise((resolve, reject) => {
        const nameLc = newCpt.name.toLowerCase();
        const fileName = 'viewTpl.vue';

        const sourceFile = path.join(__dirname, './' + fileName);
        const destPath = path.join(__dirname, '../src/demo/', nameLc + '.vue');

        const readStream = fs.createReadStream(sourceFile);
        const writeStream = fs.createWriteStream(destPath);
        readStream.pipe(writeStream);
        resolve('生成文档模板文件成功');
    });
}

function createDemo() {
    return new Promise((resolve, reject) => {
        const nameLc = newCpt.name.toLowerCase();
        const fileName = 'demoTpl.vue';

        const sourceFile = path.join(__dirname, './' + fileName);
        const destPath = path.join(__dirname, '../src/view/', nameLc + '.vue');

        const readStream = fs.createReadStream(sourceFile);
        const writeStream = fs.createWriteStream(destPath);
        readStream.pipe(writeStream);
        resolve('生成示例模板文件成功');
    });
}

function addToPackageJson() {
    return new Promise((resolve, reject) => {
        conf.packages.push(newCpt);
        const dirPath = path.join(__dirname, `../`);
        const filePath = path.join(dirPath, `package.json`);
        fs.writeFile(filePath, JSON.stringify(conf, null, 2), (err) => {
            if (err) throw err;
            resolve(`修改package.json文件成功`);
        });
    });
}

function createNew() {
    createIndexJs().then(() => {
        if (newCpt.type == 'component' || newCpt.type == 'method') {
            return createVue();
        } else {
            return;
        }
    }).then(() => {
        return createView();
    }).then(() => {
        return createDemo();
    }).then(() => {
        return addToPackageJson();
    }).then(() => {
        process.exit();
    });
}

init();