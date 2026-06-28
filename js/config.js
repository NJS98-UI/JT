// ==================== 固定口令配置表 ====================
const fixedPasswords = {
    traveler: {
        '0406': '*#20230730#*'
    },
    dasheng: {
        'fixed': '*#20220730#*'
    },
    x70plus: {
        'unknown': '*#20201030#*'
    },
    x90plus: {
        '040x': '*#20230730#*',
        'unknown': '*#20201030#*'
    },
    x95: {
        'unknown': '*#20201030#*'
    },
    shanhal7: {
        'unknown': '*#20201030#*'
    },
    shanhal9: {
        'unknown': '*#20201030#*'
    }
};

// ==================== 车型配置 ====================
const carModels = {
    traveler: {
        name: '捷途旅行者/山海T2',
        versions: ['00x', '0406', '0407', 'other', 'cdm'],
        versionNames: {
            '00x': '00.08及以下',
            '0406': '4.06及以下',
            '0407': '4.07以上',
            'other': '其他',
            'cdm': '26款'
        },
        algorithms: {
            '00x': 'serialNumber',
            '0406': 'dynamic230830',
            '0407': 'dynamic250110',
            'other': 'serialNumberDaily',
            'cdm': 'dynamic250930'
        },
        encrypted: {
            '00x': false,
            '0406': false,
            '0407': false,
            'other': false,
            'cdm': false
        },
        defaultVersion: '0407'
    },
    ziyouzhe: {
        name: '自由者/山海T1',
        versions: ['11010x', '01010x', '000402'],
        versionNames: {
            '11010x': '11.01.04及以上',
            '01010x': '01.01.0x',
            '000402': '00.04.02'
        },
        algorithms: {
            '11010x': 'dynamic240910',
            '01010x': 'dynamic240910',
            '000402': 'ziyouzhe000402'
        },
        encrypted: {
            '11010x': false,
            '01010x': false,
            '000402': false
        },
        defaultVersion: '11010x'
    },
    shanhal7: {
        name: '山海L7/Plus/T9',
        versions: ['os10201', 'os1201000'],
        versionNames: {
            'os10201': 'OS1-02.01',
            'os1201000': 'OS1_20.10.00'
        },
        algorithms: {
            'os10201': 'otherCars',
            'os1201000': 'otherCars'
        },
        encrypted: {
            'os10201': false,
            'os1201000': false
        },
        defaultVersion: 'os1201000'
    },
    shanhal9: {
        name: '山海L9',
        versions: ['unknown'],
        versionNames: { 'unknown': '其他版本' },
        algorithms: { 'unknown': 'otherCars' },
        encrypted: { 'unknown': false },
        defaultVersion: 'unknown'
    },
    hu8: {
        name: '虎8/8L',
        versions: ['unknown', 'latest'],
        versionNames: { 'unknown': '其他版本', 'latest': '最新版本' },
        algorithms: { 'unknown': 'hu8Daily', 'latest': 'ruihuRandomCode' },
        encrypted: { 'unknown': false, 'latest': false },
        defaultVersion: 'unknown'
    },
    ruihu9x: {
        name: '瑞虎9x',
        versions: ['unknown', 'latest'],
        versionNames: { 'unknown': '其他版本', 'latest': '最新版本' },
        algorithms: { 'unknown': 'hu8Daily', 'latest': 'ruihuRandomCode' },
        encrypted: { 'unknown': false, 'latest': false },
        defaultVersion: 'unknown'
    },
    ruihu8pro: {
        name: '瑞虎8PRO冠军版',
        versions: ['pre3', 'post3', 'latest'],
        versionNames: {
            'pre3': '2.0',
            'post3': '3.0及以上',
            'latest': '最新版本'
        },
        algorithms: {
            'pre3': 'ruihu8proPre3',
            'post3': 'ruihu8proPost3',
            'latest': 'ruihuRandomCode'
        },
        encrypted: {
            'pre3': false,
            'post3': false,
            'latest': false
        },
        defaultVersion: 'post3'
    },
    x70plus: {
        name: 'X70Plus/L/Pro/CDM',
        versions: ['unknown'],
        versionNames: { 'unknown': '00.01.0x' },
        algorithms: { 'unknown': 'otherCars' },
        encrypted: { 'unknown': false },
        defaultVersion: 'unknown'
    },
    x70l: {
        name: '捷途X70L',
        versions: ['26'],
        versionNames: { '26': '26款' },
        algorithms: { '26': 'serialNumber' },
        encrypted: { '26': false },
        defaultVersion: '26'
    },
    x90plus: {
        name: 'X90/Plus/Pro/CDM',
        versions: ['040x', 'unknown'],
        versionNames: { '040x': '04.0x', 'unknown': '其他版本' },
        algorithms: { '040x': 'fixed', 'unknown': 'otherCars' },
        encrypted: { '040x': false, 'unknown': false },
        defaultVersion: '040x'
    },
    x95: {
        name: 'X95',
        versions: ['unknown'],
        versionNames: { 'unknown': '其他版本' },
        algorithms: { 'unknown': 'otherCars' },
        encrypted: { 'unknown': false },
        defaultVersion: 'unknown'
    },
    dasheng: {
        name: '捷途大圣',
        versions: ['fixed'],
        versionNames: { 'fixed': '固定口令' },
        algorithms: { 'fixed': 'dashengFixed' },
        encrypted: { 'fixed': false },
        defaultVersion: 'fixed'
    }
};

// 如果使用模块化 (Node.js) 则导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fixedPasswords, carModels };
}