// ==================== 主程序逻辑 ====================
(function() {
    // DOM元素
    const carModelSelect = document.getElementById('carModelSelect');
    const versionButtonsContainer = document.getElementById('versionButtons');
    const versionGroup = document.getElementById('versionGroup');
    const serialNumberGroup = document.getElementById('serialNumberGroup');
    const serialNumberInput = document.getElementById('serialNumberInput');
    const serialLabel = document.getElementById('serialLabel');
    const resultCard = document.getElementById('resultCard');
    const resultArea = document.getElementById('resultArea');
    const resultBadge = document.getElementById('resultBadge');
    const algoBadge = document.getElementById('algoBadge');
    const countdownBar = document.getElementById('countdownBar');
    const countdownTimer = document.getElementById('countdownTimer');
    const toast = document.getElementById('toast');

    let currentCarModel = null;
    let currentVersion = null;
    let currentAlgorithmName = null;
    let currentAlgorithm = null;
    let countdownInterval = null;
    let currentCountdownType = 'none';

    // 初始化车型下拉框
    function initCarModelSelect() {
        carModelSelect.innerHTML = '<option value="">-- 请选择车型 --</option>';
        for (const [key, config] of Object.entries(carModels)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = config.name;
            carModelSelect.appendChild(option);
        }
    }

    // 更新版本按钮组
    function updateVersionButtons(carModelKey, selectDefault = true) {
        versionButtonsContainer.innerHTML = '';
        if (!carModelKey || !carModels[carModelKey]) {
            versionGroup.style.display = 'none';
            return;
        }
        const config = carModels[carModelKey];
        versionGroup.style.display = 'block';
        const defaultVer = config.defaultVersion || config.versions[0];
        config.versions.forEach(ver => {
            const btn = document.createElement('button');
            btn.className = 'version-btn';
            btn.textContent = config.versionNames[ver] || ver;
            btn.dataset.version = ver;
            btn.addEventListener('click', function() {
                document.querySelectorAll('.version-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                handleVersionChange(this.dataset.version);
            });
            versionButtonsContainer.appendChild(btn);
        });

        if (selectDefault) {
            const defaultBtn = versionButtonsContainer.querySelector(`.version-btn[data-version="${defaultVer}"]`);
            if (defaultBtn) {
                defaultBtn.classList.add('active');
                handleVersionChange(defaultVer);
            } else {
                const firstBtn = versionButtonsContainer.querySelector('.version-btn');
                if (firstBtn) {
                    firstBtn.classList.add('active');
                    handleVersionChange(firstBtn.dataset.version);
                }
            }
        }
    }

    // 版本切换处理
    function handleVersionChange(versionKey) {
        currentVersion = versionKey;
        if (!currentCarModel || !currentVersion) {
            currentAlgorithmName = null;
            currentAlgorithm = null;
            serialNumberGroup.style.display = 'none';
            resultCard.style.display = 'none';
            algoBadge.style.display = 'none';
            clearCountdown();
            return;
        }
        const algoInfo = getAlgorithmInfo(currentCarModel, currentVersion);
        if (algoInfo) {
            currentAlgorithmName = algoInfo.name;
            currentAlgorithm = algoInfo.algorithm;
            // 设置输入框标签
            if (currentAlgorithm.labelText) {
                serialLabel.textContent = currentAlgorithm.labelText;
                serialNumberInput.placeholder = currentAlgorithm.placeholder || '请输入';
            } else if (currentAlgorithm.useVin) {
                serialLabel.textContent = 'VIN后6位（车架号）';
                serialNumberInput.placeholder = '请输入VIN后6位';
            } else {
                serialLabel.textContent = '序列号（后6位）';
                serialNumberInput.placeholder = '请输入序列号后6位数字';
            }
            if (currentAlgorithm.showSerialNumberInput) {
                serialNumberGroup.style.display = 'block';
                serialNumberInput.value = '';
                doCalculate();
            } else {
                serialNumberGroup.style.display = 'none';
                serialNumberInput.value = '';
                doCalculate();
            }
        } else {
            currentAlgorithmName = null;
            currentAlgorithm = null;
            serialNumberGroup.style.display = 'none';
            resultCard.style.display = 'none';
            algoBadge.style.display = 'none';
            clearCountdown();
        }
    }

    // 获取当前算法信息
    function getAlgorithmInfo(carModelKey, versionKey) {
        if (!carModelKey || !versionKey || !carModels[carModelKey]) return null;
        const config = carModels[carModelKey];
        const algoName = config.algorithms[versionKey];
        if (!algoName) return null;
        const algo = algorithms[algoName];
        if (!algo) return null;
        return {
            name: algoName,
            algorithm: algo,
            config: config,
            version: versionKey,
            carModel: carModelKey
        };
    }

    // 执行计算
    function doCalculate() {
        if (!currentCarModel || !currentVersion || !currentAlgorithmName || !currentAlgorithm) {
            resultCard.style.display = 'none';
            clearCountdown();
            return;
        }

        const timeParams = getCurrentTimeParams();
        const params = {
            carModel: currentCarModel,
            version: currentVersion,
            ...timeParams,
            serialNumber: serialNumberInput ? serialNumberInput.value.trim() : ''
        };

        let result;
        try {
            result = currentAlgorithm.calculate(params);
        } catch (e) {
            console.error('计算失败:', e);
            result = { carPassword: '计算错误', adbPassword: '计算错误' };
        }

        algoBadge.style.display = 'none';
        renderResult(result, currentAlgorithmName);

        currentCountdownType = currentAlgorithm.countdown || 'none';
        updateCountdownDisplay(currentCountdownType, timeParams.now);
        setupCountdown(currentCountdownType);

        resultCard.style.display = 'block';
        if (currentCountdownType !== 'none') {
            resultBadge.style.display = 'inline-block';
            resultBadge.textContent = '动态有效';
            resultBadge.className = 'card-header-badge warning';
        } else {
            resultBadge.style.display = 'inline-block';
            resultBadge.textContent = '固定口令';
            resultBadge.className = 'card-header-badge active';
        }
    }

    // 渲染结果
    function renderResult(result, algoName) {
        resultArea.innerHTML = '';

        if (algoName === 'otherCars' && result.passwords && Array.isArray(result.passwords)) {
            const filtered = result.passwords.filter(p => p !== '--');
            const ul = document.createElement('ul');
            ul.className = 'password-list';

            const labels = [];
            if (currentCarModel === 'ziyouzhe' && currentVersion === '11010x') {
                labels.push('工程模式', '加密项');
            } else if (currentCarModel === 'shanhal7') {
                labels.push('固定密码1', '每日密码', '动态密码');
            } else {
                labels.push('固定密码1', '固定密码2', '动态密码');
            }

            filtered.forEach((pw, index) => {
                const li = document.createElement('li');
                const idxSpan = document.createElement('span');
                idxSpan.className = 'pw-index';
                idxSpan.textContent = index + 1;
                const valSpan = document.createElement('span');
                valSpan.className = 'pw-value';
                valSpan.textContent = pw;
                valSpan.title = pw;
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn btn-xs';
                copyBtn.innerHTML = '📋 复制';
                copyBtn.title = '复制此密码';
                copyBtn.addEventListener('click', () => copyToClipboard(pw, copyBtn));

                const labelSpan = document.createElement('span');
                labelSpan.style.cssText = 'font-size:10px;color:#999;font-weight:500;letter-spacing:0.03em;flex-shrink:0;';
                labelSpan.textContent = labels[index] || `密码${index + 1}`;

                li.appendChild(idxSpan);
                li.appendChild(labelSpan);
                li.appendChild(valSpan);
                li.appendChild(copyBtn);
                ul.appendChild(li);
            });
            resultArea.appendChild(ul);
        } else if (algoName === 'dashengFixed') {
            const passwords = [
                { label: '工程模式 ①', value: result.carPassword1 || '--' },
                { label: '工程模式 ②', value: result.carPassword2 || '--' }
            ];
            passwords.forEach(pw => {
                const item = document.createElement('div');
                item.className = 'result-item highlight';
                const label = document.createElement('span');
                label.className = 'result-label';
                label.textContent = pw.label;
                const val = document.createElement('span');
                val.className = 'result-value';
                val.textContent = pw.value;
                val.title = pw.value;
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.innerHTML = '📋';
                copyBtn.title = '复制' + pw.label;
                copyBtn.addEventListener('click', () => copyToClipboard(pw.value, copyBtn));
                item.appendChild(label);
                item.appendChild(val);
                item.appendChild(copyBtn);
                resultArea.appendChild(item);
            });
        } else if (algoName.startsWith('ruihu8pro') || algoName === 'hu8Daily') {
            const items = [];
            items.push({ label: '工程模式', value: result.carPassword || '设置-系统-空白处点8下进入', copy: false });
            items.push({ label: '升级模式', value: result.upgradeEntry || '设置-系统升级-当前已是最新版点8下', copy: false });
            const encPwd = result.adbPassword || result.systemPassword || '--';
            items.push({ label: '加密项', value: encPwd, copy: true });
            const upPwd = result.upgradePassword || '请输入VIN';
            items.push({ label: '升级密码', value: upPwd, copy: true });

            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'result-item highlight';
                const label = document.createElement('span');
                label.className = 'result-label';
                label.textContent = item.label;
                const val = document.createElement('span');
                val.className = 'result-value';
                val.textContent = item.value;
                val.title = item.value;
                div.appendChild(label);
                div.appendChild(val);
                if (item.copy) {
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'copy-btn';
                    copyBtn.innerHTML = '📋';
                    copyBtn.title = '复制' + item.label;
                    copyBtn.addEventListener('click', () => copyToClipboard(item.value, copyBtn));
                    div.appendChild(copyBtn);
                }
                resultArea.appendChild(div);
            });
        } else {
            const carPw = result.carPassword || '--';
            const adbPw = result.adbPassword || '--';
            const isSerialAlgo = (algoName === 'serialNumber');

            const item1 = document.createElement('div');
            item1.className = 'result-item highlight';
            const label1 = document.createElement('span');
            label1.className = 'result-label';
            label1.textContent = '工程模式';
            const val1 = document.createElement('span');
            val1.className = 'result-value' + (currentCountdownType !== 'none' ? ' dynamic' : '');
            val1.textContent = carPw;
            val1.title = carPw;
            const copy1 = document.createElement('button');
            copy1.className = 'copy-btn';
            copy1.innerHTML = '📋';
            copy1.title = '复制工程模式';
            copy1.addEventListener('click', () => copyToClipboard(carPw, copy1));
            item1.appendChild(label1);
            item1.appendChild(val1);
            item1.appendChild(copy1);

            const item2 = document.createElement('div');
            item2.className = 'result-item';
            const label2 = document.createElement('span');
            label2.className = 'result-label';
            label2.textContent = isSerialAlgo ? '加密项' : '加密项';
            const val2 = document.createElement('span');
            val2.className = 'result-value' + (adbPw === '无' ? ' muted' : '') + (currentCountdownType !== 'none' && adbPw !== '无' ? ' dynamic' : '');
            val2.textContent = adbPw;
            val2.title = adbPw;
            const copy2 = document.createElement('button');
            copy2.className = 'copy-btn';
            copy2.innerHTML = '📋';
            copy2.title = isSerialAlgo ? '复制加密项' : '复制加密项';
            copy2.addEventListener('click', () => copyToClipboard(adbPw, copy2));
            item2.appendChild(label2);
            item2.appendChild(val2);
            item2.appendChild(copy2);

            resultArea.appendChild(item1);
            resultArea.appendChild(item2);
        }
    }

    // 复制到剪贴板
    function copyToClipboard(text, btnElement) {
        if (!text || text === '无' || text === '------' || text === '计算错误') return;
        navigator.clipboard.writeText(text).then(() => {
            if (btnElement) {
                btnElement.classList.add('copied');
                btnElement.innerHTML = '✅ 已复制';
                setTimeout(() => {
                    btnElement.classList.remove('copied');
                    btnElement.innerHTML = '📋 复制';
                }, 1800);
            }
            showToast('已复制到剪贴板', 'success');
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            if (btnElement) {
                btnElement.classList.add('copied');
                btnElement.innerHTML = '✅ 已复制';
                setTimeout(() => {
                    btnElement.classList.remove('copied');
                    btnElement.innerHTML = '📋 复制';
                }, 1800);
            }
            showToast('已复制到剪贴板', 'success');
        });
    }

    function showToast(message, type) {
        toast.textContent = message;
        toast.className = 'toast ' + (type || '');
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function clearCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        countdownBar.style.display = 'none';
        currentCountdownType = 'none';
    }

    function setupCountdown(type) {
        clearCountdown();
        if (type === 'none') {
            countdownBar.style.display = 'none';
            return;
        }
        countdownBar.style.display = 'flex';
        const updateFn = () => {
            const now = new Date();
            updateCountdownDisplay(type, now);
            if (type === 'hourly' && now.getMinutes() === 0 && now.getSeconds() === 0) doCalculate();
            if (type === 'daily' && now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) doCalculate();
        };
        updateFn();
        countdownInterval = setInterval(updateFn, 1000);
    }

    function updateCountdownDisplay(type, now) {
        if (type === 'hourly') {
            const remainingMin = 59 - now.getMinutes();
            const remainingSec = 59 - now.getSeconds();
            countdownTimer.textContent = `${String(remainingMin).padStart(2, '0')}:${String(remainingSec).padStart(2, '0')}`;
        } else if (type === 'daily') {
            const remainingH = 23 - now.getHours();
            const remainingMin = 59 - now.getMinutes();
            const remainingSec = 59 - now.getSeconds();
            countdownTimer.textContent = `${String(remainingH).padStart(2, '0')}:${String(remainingMin).padStart(2, '0')}:${String(remainingSec).padStart(2, '0')}`;
        } else {
            countdownTimer.textContent = '--:--:--';
        }
    }

    // 事件监听
    carModelSelect.addEventListener('change', function() {
        const carModelKey = this.value;
        currentCarModel = carModelKey || null;
        currentVersion = null;
        currentAlgorithmName = null;
        currentAlgorithm = null;
        serialNumberGroup.style.display = 'none';
        serialNumberInput.value = '';
        resultCard.style.display = 'none';
        algoBadge.style.display = 'none';
        clearCountdown();
        if (currentCarModel) {
            updateVersionButtons(currentCarModel, true);
        } else {
            versionGroup.style.display = 'none';
            versionButtonsContainer.innerHTML = '';
        }
    });

    serialNumberInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 6);
        if (currentAlgorithm && currentAlgorithm.showSerialNumberInput) doCalculate();
    });

    // 初始化
    function init() {
        initCarModelSelect();
        versionGroup.style.display = 'none';
        serialNumberGroup.style.display = 'none';
        resultCard.style.display = 'none';
        algoBadge.style.display = 'none';
        countdownBar.style.display = 'none';
        carModelSelect.value = 'traveler';
        currentCarModel = 'traveler';
        updateVersionButtons('traveler', true);
    }

    init();

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && currentAlgorithm && resultCard.style.display !== 'none') doCalculate();
    });

    console.log('车载工程模式口令生成器已就绪');
})();