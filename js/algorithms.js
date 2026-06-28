// ==================== 辅助函数 ====================
function getFixedPassword(carModel, version) {
    if (fixedPasswords[carModel] && fixedPasswords[carModel][version]) {
        return fixedPasswords[carModel][version];
    }
    return '*#20230730#*';
}

function calculateSerialNumberDailyPassword(year, month, date) {
    const yymmdd = parseInt(`${year.toString().slice(-2)}${month}${date}`, 10);
    const lastDigit = yymmdd % 10;
    const baseValues = [213518, 658035, 235657, 567534, 647825, 234700, 127347, 875634, 345678, 982345];
    const baseValue = baseValues[lastDigit] || 213518;
    const adbFull = yymmdd + baseValue;
    return (adbFull % 1000000).toString().padStart(6, '0');
}

function calculateHu8DailyPassword(year, month, date) {
    const yymmdd = parseInt(`${year.toString().slice(-2)}${month}${date}`, 10);
    const lastDigit = yymmdd % 10;
    const baseValues = [213518, 658035, 235657, 567534, 647825, 234700, 127347, 648924, 733782, 553456];
    const baseValue = baseValues[lastDigit] || 213518;
    const adbFull = yymmdd + baseValue;
    return (adbFull % 1000000).toString().padStart(6, '0');
}

function getCurrentTimeParams() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = now.getHours();
    const hoursStr = String(hours).padStart(2, '0');
    const yearShort = String(year).slice(-2);
    const dateTimeNum = parseInt(`${yearShort}${month}${date}${hoursStr}`, 10);
    const mmddhh = parseInt(`${month}${date}${hoursStr}`, 10);
    return { year, month, date, hours, dateTimeNum, mmddhh, now };
}

// ==================== 算法实现 ====================
const algorithms = {
    fixed: {
        countdown: 'none',
        showSerialNumberInput: false,
        calculate: function(params) {
            const { carModel, version } = params;
            return {
                carPassword: getFixedPassword(carModel, version),
                adbPassword: '无'
            };
        }
    },
    dashengFixed: {
        countdown: 'none',
        showSerialNumberInput: false,
        calculate: function() {
            return { 
                carPassword1: '*#20220730#*', 
                carPassword2: '*#12040310#*' 
            };
        }
    },
    serialNumber: {
        countdown: 'none',
        showSerialNumberInput: true,
        calculate: function(params) {
            const { serialNumber } = params;
            if (serialNumber && serialNumber.length >= 6) {
                const snLastSix = serialNumber.slice(-6);
                const adbFull = 802018 * parseInt(snLastSix, 10);
                return {
                    carPassword: '*#20230730#*',
                    adbPassword: (adbFull % 1000000).toString().padStart(6, '0')
                };
            } else {
                return {
                    carPassword: '*#20230730#*',
                    adbPassword: 'xxxxxx'
                };
            }
        }
    },
    serialNumberDaily: {
        countdown: 'daily',
        showSerialNumberInput: false,
        calculate: function(params) {
            const { year, month, date } = params;
            const adbPassword = calculateSerialNumberDailyPassword(year, month, date);
            return {
                carPassword: '*#20230730#*',
                adbPassword: adbPassword
            };
        }
    },
    hu8Daily: {
        countdown: 'daily',
        showSerialNumberInput: true,
        useVin: true,
        calculate: function(params) {
            const { year, month, date, serialNumber } = params;
            const adbPassword = calculateHu8DailyPassword(year, month, date);
            let upgradePassword = '请输入VIN';
            if (serialNumber && serialNumber.length >= 6) {
                const vinLast6 = serialNumber.slice(-6);
                let vinNumStr = '';
                for (let ch of vinLast6) {
                    if (/[0-9]/.test(ch)) vinNumStr += ch;
                    else vinNumStr += '0';
                }
                const vinNum = parseInt(vinNumStr, 10);
                const base = vinNum + 123456;
                const yymmdd = parseInt(`${year.toString().slice(-2)}${month}${date}`, 10);
                const result = (base * yymmdd) % 1000000;
                upgradePassword = result.toString().padStart(6, '0');
            }
            return {
                carPassword: '设置-系统-空白处点8下进入',
                adbPassword: adbPassword,
                upgradeEntry: '设置-系统升级-当前已是最新版点8下',
                upgradePassword: upgradePassword
            };
        }
    },
    ruihuRandomCode: {
        countdown: 'none',
        showSerialNumberInput: true,
        useVin: false,
        labelText: '随机码',
        placeholder: '请输入随机码',
        calculate: function(params) {
            const { serialNumber } = params;
            if (serialNumber && serialNumber.length > 0) {
                const insertChars = ['A','b','C','d','E','f','G','h','I','j','K','l'];
                let result = '';
                for (let i = 0; i < serialNumber.length; i++) {
                    result += serialNumber[i];
                    if (i < insertChars.length) {
                        result += insertChars[i];
                    }
                }
                result += '@@';
                return {
                    carPassword: '设置-系统-空白处点8下进入',
                    adbPassword: result
                };
            } else {
                return {
                    carPassword: '设置-系统-空白处点8下进入',
                    adbPassword: '请输入随机码'
                };
            }
        }
    },
    ruihu8proPre3: {
        countdown: 'daily',
        showSerialNumberInput: true,
        useVin: true,
        calculate: function(params) {
            const { year, month, date, serialNumber } = params;
            const systemPassword = '1q2w3e';
            let upgradePassword = '请输入VIN';
            if (serialNumber && serialNumber.length >= 6) {
                const vinLast6 = serialNumber.slice(-6);
                let vinNumStr = '';
                for (let ch of vinLast6) {
                    if (/[0-9]/.test(ch)) vinNumStr += ch;
                    else vinNumStr += '0';
                }
                const vinNum = parseInt(vinNumStr, 10);
                const base = vinNum + 123456;
                const yymmdd = parseInt(`${year.toString().slice(-2)}${month}${date}`, 10);
                const result = (base * yymmdd) % 1000000;
                upgradePassword = result.toString().padStart(6, '0');
            }
            return {
                carPassword: '设置-系统-空白处点8下进入',
                systemPassword: systemPassword,
                upgradePassword: upgradePassword
            };
        }
    },
    ruihu8proPost3: {
        countdown: 'daily',
        showSerialNumberInput: true,
        useVin: true,
        calculate: function(params) {
            const { year, month, date, serialNumber } = params;
            const systemPassword = calculateSerialNumberDailyPassword(year, month, date);
            let upgradePassword = '请输入VIN';
            if (serialNumber && serialNumber.length >= 6) {
                const vinLast6 = serialNumber.slice(-6);
                let vinNumStr = '';
                for (let ch of vinLast6) {
                    if (/[0-9]/.test(ch)) vinNumStr += ch;
                    else vinNumStr += '0';
                }
                const vinNum = parseInt(vinNumStr, 10);
                const base = vinNum + 123456;
                const yymmdd = parseInt(`${year.toString().slice(-2)}${month}${date}`, 10);
                const result = (base * yymmdd) % 1000000;
                upgradePassword = result.toString().padStart(6, '0');
            }
            return {
                carPassword: '设置-系统-空白处点8下进入',
                systemPassword: systemPassword,
                upgradePassword: upgradePassword
            };
        }
    },
    dynamic250110: {
        countdown: 'hourly',
        showSerialNumberInput: false,
        calculate: function(params) {
            const { dateTimeNum, hours } = params;
            const adbFull = 250110 * dateTimeNum;
            const carBase = 250110 * dateTimeNum;
            const carFull = carBase - hours;
            return {
                carPassword: `*#${(carFull % 1000000).toString().padStart(6, '0')}#*`,
                adbPassword: (adbFull % 1000000).toString().padStart(6, '0')
            };
        }
    },
    dynamic250930: {
        countdown: 'hourly',
        showSerialNumberInput: false,
        calculate: function(params) {
            const { dateTimeNum, hours } = params;
            const adbFull = 250930 * dateTimeNum;
            const carBase = 250930 * dateTimeNum;
            const carFull = carBase - hours;
            return {
                carPassword: `*#${(carFull % 1000000).toString().padStart(6, '0')}#*`,
                adbPassword: (adbFull % 1000000).toString().padStart(6, '0')
            };
        }
    },
    dynamic240910: {
        countdown: 'hourly',
        showSerialNumberInput: false,
        calculate: function(params) {
            const { mmddhh, hours } = params;
            const adbFull = 240910 * mmddhh;
            const carFull = (240910 * mmddhh) - hours;
            return {
                carPassword: `*#${(carFull % 1000000).toString().padStart(6, '0')}#*`,
                adbPassword: (adbFull % 1000000).toString().padStart(6, '0')
            };
        }
    },
    ziyouzhe000402: {
        countdown: 'none',
        showSerialNumberInput: false,
        calculate: function() {
            return { carPassword: '*#20241130#*', adbPassword: '无' };
        }
    },
    dynamic231030: {
        countdown: 'hourly',
        showSerialNumberInput: false,
        calculate: function(params) {
            const { dateTimeNum, hours } = params;
            const adbFull = 231030 * dateTimeNum;
            const carFull = adbFull - hours;
            return {
                carPassword: `*#${(carFull % 1000000).toString().padStart(6, '0')}#*`,
                adbPassword: (adbFull % 1000000).toString().padStart(6, '0')
            };
        }
    },
    dynamic230830: {
        countdown: 'hourly',
        showSerialNumberInput: false,
        calculate: function(params) {
            const { dateTimeNum, hours } = params;
            const adbFull = 230830 * dateTimeNum;
            const carFull = (230830 * dateTimeNum) - hours;
            return {
                carPassword: `*#${(carFull % 1000000).toString().padStart(6, '0')}#*`,
                adbPassword: (adbFull % 1000000).toString().padStart(6, '0')
            };
        }
    },
    otherCars: {
        countdown: 'hourly',
        showSerialNumberInput: false,
        calculate: function(params) {
            const { carModel, version, year, month, date, dateTimeNum, hours, mmddhh } = params;
            const passwords = [];
            if (carModel === 'ziyouzhe' && version === '11010x') {
                const adbPwd = (240910 * mmddhh) % 1000000;
                const carPwd = ((240910 * mmddhh) - hours) % 1000000;
                passwords.push(`*#${carPwd.toString().padStart(6, '0')}#*`);
                passwords.push(adbPwd.toString().padStart(6, '0'));
                passwords.push('--');
            } else if (carModel === 'shanhal7') {
                const p3 = (231030 * dateTimeNum) - hours;
                passwords.push('*#20201030#*');
                passwords.push(calculateSerialNumberDailyPassword(year, month, date));
                passwords.push(`*#${(p3 % 1000000).toString().padStart(6, '0')}#*`);
            } else {
                const p3 = (231030 * dateTimeNum) - hours;
                passwords.push('*#20201030#*');
                passwords.push('*#20230730#*');
                passwords.push(`*#${(p3 % 1000000).toString().padStart(6, '0')}#*`);
            }
            return { passwords: passwords };
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { algorithms, getCurrentTimeParams, calculateSerialNumberDailyPassword, calculateHu8DailyPassword };
}