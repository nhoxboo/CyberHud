document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const connectButton = document.getElementById('connectBleButton');
    const bleStateContainer = document.getElementById('bleState');
    const statusDot = document.querySelector('.status-dot');
    const configBlock = document.getElementById('configBlock');
    const unsupportedBrowser = document.getElementById('unsupported-browser');

    const sendButton = document.getElementById('sendButton');
    const sendState = document.getElementById('sendState');

    const transferFileButton = document.getElementById('transfer-file-button');
    const transferPercent = document.getElementById('file-transfer-percent');
    
    const sliders = document.querySelectorAll('input[type="range"]');
    const configControls = document.querySelectorAll('.config-control');

    // --- BLE Constants ---
    const DEVICE_NAME = 'VIETMAP_HUD';
    const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
    const WRITE_CHAR_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';
    const NOTIF_CHAR_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
    const FILE_BLOCK_UUID = '0000fff3-0000-1000-8000-00805f9b34fb';
    const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';
    const FIRMWARE_CHAR_UUID = '00002a26-0000-1000-8000-00805f9b34fb';

    // --- App State ---
    let bleServer;
    let configCharacteristic;
    let fileBlockCharacteristic;
    let isConnected = false;
    
    // --- UI Update Functions ---
    const setConnectionStatus = (status) => {
        bleStateContainer.textContent = status;
        statusDot.className = 'status-dot'; // Reset classes
        switch (status) {
            case 'Đã kết nối':
                statusDot.classList.add('connected');
                configBlock.style.display = 'grid';
                connectButton.style.display = 'none';
                break;
            case 'Đang kết nối...':
                statusDot.classList.add('connecting');
                break;
            default: // Disconnected
                statusDot.classList.add('disconnected');
                configBlock.style.display = 'none';
                connectButton.style.display = 'inline-flex';
                break;
        }
    };

    const updateSliderValue = (slider) => {
        const display = slider.parentElement.querySelector('.slider-value');
        if (display) {
            display.textContent = slider.value;
        }
    };
    
    sliders.forEach(slider => {
        slider.addEventListener('input', () => updateSliderValue(slider));
    });

    // --- BLE Functions ---
    const onDisconnected = (event) => {
        isConnected = false;
        setConnectionStatus('Đã mất kết nối');
        console.log('Thiết bị đã mất kết nối');
    };

    const connectDevice = async () => {
        if (!navigator.bluetooth) {
            unsupportedBrowser.style.display = 'block';
            connectButton.style.display = 'none';
            console.error('Web Bluetooth API is not available.');
            return;
        }

        try {
            console.log('Đang yêu cầu thiết bị...');
            setConnectionStatus('Đang kết nối...');
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ name: DEVICE_NAME }],
                optionalServices: [SERVICE_UUID, DEVICE_INFO_SERVICE_UUID]
            });

            device.addEventListener('gattserverdisconnected', onDisconnected);

            console.log('Đang kết nối tới GATT Server...');
            bleServer = await device.gatt.connect();

            console.log('Đang lấy Service chính...');
            const service = await bleServer.getPrimaryService(SERVICE_UUID);
            
            console.log('Đang lấy Characteristics...');
            configCharacteristic = await service.getCharacteristic(WRITE_CHAR_UUID);
            fileBlockCharacteristic = await service.getCharacteristic(FILE_BLOCK_UUID);
            const notificationCharacteristic = await service.getCharacteristic(NOTIF_CHAR_UUID);

            // Bắt đầu lắng nghe thông báo từ HUD
            await notificationCharacteristic.startNotifications();
            notificationCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);
            
            isConnected = true;
            setConnectionStatus('Đã kết nối');
            console.log('Kết nối thành công!');
            
            // >>> TÍNH NĂNG MỚI: Gửi yêu cầu để lấy cấu hình hiện tại từ HUD <<<
            console.log('Đang yêu cầu cấu hình từ HUD...');
            // Gửi một chuỗi đặc biệt, firmware của bạn cần nhận diện chuỗi này để gửi lại cấu hình
            const requestConfigCmd = new TextEncoder().encode('LOAD'); 
            await configCharacteristic.writeValueWithoutResponse(requestConfigCmd);

        } catch (error) {
            console.error('Lỗi kết nối:', error);
            setConnectionStatus('Kết nối thất bại');
        }
    };
    
    /**
     * Xử lý dữ liệu cấu hình nhận được từ HUD
     * @param {Event} event Sự kiện chứa dữ liệu
     */
    const handleNotifications = (event) => {
        const value = event.target.value;
        const decoder = new TextDecoder('utf-8');
        const configString = decoder.decode(value);

        console.log('Nhận được dữ liệu từ HUD:', configString);
        // Chỉ xử lý nếu chuỗi nhận về là chuỗi cấu hình
        if (configString.includes(';')) {
            parseAndApplyConfig(configString);
        }
    };

    /**
     * Phân tích chuỗi cấu hình và cập nhật giao diện web
     * @param {string} configString Chuỗi cấu hình từ HUD (vd: "BKHN;led_brightness=8;...")
     */
    const parseAndApplyConfig = (configString) => {
        console.log('Áp dụng cấu hình:', configString);
        const params = configString.split(';');
        params.forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
                const element = document.getElementById(key);
                if (element) {
                    element.value = value;
                    // Nếu là thanh trượt, cập nhật cả giá trị hiển thị
                    if (element.type === 'range') {
                        updateSliderValue(element);
                    }
                }
            }
        });
        alert('Đã tải thành công cấu hình từ CyberHud!');
    };
    
    /**
     * Lấy giá trị từ các ô input và gửi tới HUD
     */
    const sendConfig = async () => {
        if (!isConnected) {
            alert('Chưa kết nối với CyberHud!');
            return;
        }

        // Tạo chuỗi cấu hình từ các giá trị trên giao diện
        let configString = 'BKHN';
        configControls.forEach(control => {
            configString += `;${control.id}=${control.value}`;
        });
        
        console.log('Đang gửi cấu hình:', configString);

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(configString);
            await configCharacteristic.writeValueWithoutResponse(data);
            
            sendState.textContent = 'Đã gửi thành công!';
            setTimeout(() => { sendState.textContent = ''; }, 3000);

        } catch(error) {
            console.error('Lỗi khi gửi cấu hình:', error);
            sendState.textContent = 'Gửi thất bại!';
        }
    };
    
    // --- File Transfer --- (Giữ nguyên, không thay đổi)
    const handleFileSelect = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/jpeg';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 100 * 1024) { // Limit 100KB
                alert('Kích thước ảnh phải nhỏ hơn 100KB.');
                return;
            }

            const arrayBuffer = await file.arrayBuffer();
            transferFile(arrayBuffer);
        };
        fileInput.click();
    };

    const transferFile = async (fileData) => {
        if (!isConnected) {
             alert('Chưa kết nối với CyberHud!');
            return;
        }
        
        transferPercent.style.display = 'block';
        const progressIndicator = transferPercent.querySelector('.progress');
        const progressText = transferPercent.querySelector('span');

        const chunkSize = 128;
        let offset = 0;

        try {
            while (offset < fileData.byteLength) {
                const chunk = fileData.slice(offset, offset + chunkSize);
                await fileBlockCharacteristic.writeValueWithoutResponse(chunk);
                
                offset += chunk.byteLength;
                const percentComplete = Math.round((offset / fileData.byteLength) * 100);
                
                progressIndicator.style.width = `${percentComplete}%`;
                progressText.textContent = `${percentComplete}%`;
                
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            await fileBlockCharacteristic.writeValueWithoutResponse(new TextEncoder().encode('EOF'));
            
            progressText.textContent = 'Hoàn tất! CyberHud sẽ khởi động lại.';
            setTimeout(() => { transferPercent.style.display = 'none'; }, 5000);

        } catch (error) {
             console.error('Lỗi khi tải file:', error);
             progressText.textContent = 'Tải lên thất bại!';
        }
    };


    // --- Event Listeners ---
    connectButton.addEventListener('click', connectDevice);
    sendButton.addEventListener('click', sendConfig);
    transferFileButton.addEventListener('click', handleFileSelect);

    // --- Initialize ---
    setConnectionStatus('Chưa kết nối');
    sliders.forEach(updateSliderValue);
});