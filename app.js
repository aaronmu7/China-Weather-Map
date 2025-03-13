// 天气 API 密钥（使用免费的 OpenWeatherMap API）
// 注意：在实际应用中，应该将 API 密钥保存在服务器端
const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // 请替换为您的 API 密钥
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

// 初始化地图
const map = L.map('map').setView([35.8617, 104.1954], 4); // 中国中心位置

// 添加地图图层
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

// 存储城市标记的对象
const markers = {};
let activeMarker = null;

// 初始化页面
function initApp() {
    updateTime();
    addCityMarkers();
    
    // 每分钟更新时间
    setInterval(updateTime, 60000);
}

// 更新时间显示
function updateTime() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString('zh-CN');
}

// 添加城市标记到地图
function addCityMarkers() {
    cities.forEach(city => {
        // 创建自定义标记
        const markerIcon = L.divIcon({
            className: 'city-marker',
            iconSize: [12, 12]
        });
        
        // 添加标记到地图
        const marker = L.marker([city.lat, city.lng], {
            icon: markerIcon,
            title: city.name
        }).addTo(map);
        
        // 增加点击区域
        const clickRadius = city.clickRadius || 15;
        const clickableArea = L.circle([city.lat, city.lng], {
            radius: clickRadius * 1000,  // 转换为米
            fillColor: 'transparent',
            fillOpacity: 0,
            stroke: false,
            interactive: true
        }).addTo(map);
        
        // 添加点击事件到标记
        marker.on('click', () => {
            activateCity(marker, city);
        });
        
        // 添加点击事件到点击区域
        clickableArea.on('click', () => {
            activateCity(marker, city);
        });
        
        // 存储标记引用
        markers[city.id] = {
            marker: marker,
            clickableArea: clickableArea
        };
    });
}

// 激活选中的城市
function activateCity(marker, city) {
    // 移除之前激活的标记样式
    if (activeMarker) {
        activeMarker.getElement().classList.remove('active');
    }
    
    // 添加激活样式
    marker.getElement().classList.add('active');
    activeMarker = marker;
    
    // 获取天气数据
    getWeatherData(city);
    
    // 平滑移动到城市位置
    map.flyTo([city.lat, city.lng], 6, {
        duration: 1.5,
        easeLinearity: 0.25
    });
}

// 获取城市天气数据
async function getWeatherData(city) {
    try {
        // 显示加载状态
        document.getElementById('weather-details').innerHTML = '<div class="placeholder-message">正在加载天气数据...</div>';
        
        // 构建 API URL
        const url = `${WEATHER_API_URL}?lat=${city.lat}&lon=${city.lng}&units=metric&lang=zh_cn&appid=${API_KEY}`;
        
        // 模拟 API 调用（由于没有真实的 API 密钥，我们使用模拟数据）
        // 在实际应用中，应该使用以下代码获取真实数据：
        // const response = await fetch(url);
        // const data = await response.json();
        
        // 模拟数据
        const data = await getMockWeatherData(city);
        
        // 显示天气动画
        displayWeatherAnimation(data.weather[0].main);
        
        // 显示天气数据
        displayWeatherData(city, data);
    } catch (error) {
        console.error('获取天气数据时出错:', error);
        document.getElementById('weather-details').innerHTML = `
            <div class="placeholder-message">
                获取天气数据时出错。<br>请稍后再试。
            </div>
        `;
        
        // 清除天气动画
        document.getElementById('weather-animation-container').innerHTML = '';
    }
}

// 显示天气动画
function displayWeatherAnimation(weatherMain) {
    const animationContainer = document.getElementById('weather-animation-container');
    const animationType = weatherAnimations[weatherMain] || 'cloudy';
    
    let animationHTML = '';
    
    switch (animationType) {
        case 'sunny':
            animationHTML = `
                <div class="weather-animation sunny">
                    <div class="sun"></div>
                </div>
            `;
            break;
        case 'cloudy':
            animationHTML = `
                <div class="weather-animation cloudy">
                    <div class="cloud"></div>
                    <div class="cloud"></div>
                </div>
            `;
            break;
        case 'rainy':
            animationHTML = `
                <div class="weather-animation rainy">
                    <div class="cloud"></div>
                    <div class="rain"></div>
                    <div class="rain"></div>
                    <div class="rain"></div>
                    <div class="rain"></div>
                    <div class="rain"></div>
                </div>
            `;
            break;
        case 'stormy':
            animationHTML = `
                <div class="weather-animation stormy">
                    <div class="cloud"></div>
                    <div class="lightning"></div>
                </div>
            `;
            break;
        case 'snowy':
            animationHTML = `
                <div class="weather-animation snowy">
                    <div class="cloud"></div>
                    <div class="snow"></div>
                    <div class="snow"></div>
                    <div class="snow"></div>
                    <div class="snow"></div>
                    <div class="snow"></div>
                </div>
            `;
            break;
        case 'misty':
            animationHTML = `
                <div class="weather-animation misty">
                    <div class="fog"></div>
                    <div class="fog"></div>
                    <div class="fog"></div>
                    <div class="fog"></div>
                </div>
            `;
            break;
    }
    
    // 添加动画效果
    animationContainer.innerHTML = animationHTML;
    
    // 添加淡入效果
    setTimeout(() => {
        const animation = animationContainer.querySelector('.weather-animation');
        if (animation) {
            animation.style.opacity = '0';
            animation.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                animation.style.opacity = '1';
            }, 50);
        }
    }, 0);
}

// 模拟天气数据（仅用于演示）
function getMockWeatherData(city) {
    return new Promise(resolve => {
        // 模拟网络延迟
        setTimeout(() => {
            // 随机温度 (10°C 到 35°C)
            const temp = Math.floor(Math.random() * 25) + 10;
            
            // 随机天气状况
            const weatherConditions = [
                { main: "Clear", description: "晴天", icon: "01d" },
                { main: "Clouds", description: "多云", icon: "03d" },
                { main: "Rain", description: "小雨", icon: "10d" },
                { main: "Drizzle", description: "毛毛雨", icon: "09d" },
                { main: "Thunderstorm", description: "雷雨", icon: "11d" }
            ];
            const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
            
            // 随机湿度 (30% 到 90%)
            const humidity = Math.floor(Math.random() * 60) + 30;
            
            // 随机风速 (0 到 10 m/s)
            const windSpeed = (Math.random() * 10).toFixed(1);
            
            // 随机气压 (990 到 1030 hPa)
            const pressure = Math.floor(Math.random() * 40) + 990;
            
            // 返回模拟数据
            resolve({
                weather: [{ 
                    main: weather.main, 
                    description: weather.description,
                    icon: weather.icon
                }],
                main: {
                    temp: temp,
                    feels_like: temp - 2,
                    humidity: humidity,
                    pressure: pressure
                },
                wind: {
                    speed: windSpeed
                },
                visibility: 10000,
                dt: Date.now() / 1000
            });
        }, 500); // 500ms 延迟
    });
}

// 显示天气数据
function displayWeatherData(city, data) {
    const weatherDetails = document.getElementById('weather-details');
    
    // 格式化更新时间
    const updateTime = new Date(data.dt * 1000).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // 构建天气图标 URL
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    // 构建 HTML
    weatherDetails.innerHTML = `
        <div class="city-weather">
            <h3 class="city-name">${city.name}</h3>
            
            <div class="weather-main">
                <div class="temperature">${Math.round(data.main.temp)}°C</div>
                <img class="weather-icon" src="${iconUrl}" alt="${data.weather[0].description}">
            </div>
            
            <div class="weather-description">${data.weather[0].description}</div>
            
            <div class="weather-details-grid">
                <div class="weather-detail-item">
                    <div class="detail-label">体感温度</div>
                    <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
                </div>
                
                <div class="weather-detail-item">
                    <div class="detail-label">湿度</div>
                    <div class="detail-value">${data.main.humidity}%</div>
                </div>
                
                <div class="weather-detail-item">
                    <div class="detail-label">风速</div>
                    <div class="detail-value">${data.wind.speed} m/s</div>
                </div>
                
                <div class="weather-detail-item">
                    <div class="detail-label">气压</div>
                    <div class="detail-value">${data.main.pressure} hPa</div>
                </div>
            </div>
            
            <div class="update-info" style="margin-top: 20px; font-size: 0.8rem; color: #7f8c8d;">
                数据更新于: ${updateTime}
            </div>
        </div>
    `;
    
    // 添加淡入效果
    const cityWeather = weatherDetails.querySelector('.city-weather');
    if (cityWeather) {
        cityWeather.style.opacity = '0';
        cityWeather.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            cityWeather.style.opacity = '1';
        }, 50);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);