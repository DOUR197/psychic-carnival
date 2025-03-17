document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // 浏览器兼容性检查
    const isIE = /*@cc_on!@*/false || !!document.documentMode;
    const isEdge = !isIE && !!window.StyleMedia;
    const isChrome = !!window.chrome;
    const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
    const isFirefox = typeof InstallTrigger !== 'undefined';
    
    // 导航菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // 在适当的滚动位置激活导航链接
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    // 轮转展示功能
    const carousel = document.querySelector('.gallery-carousel');
    const items = carousel ? document.querySelectorAll('.gallery-carousel .gallery-item') : [];
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentIndex = 0;
    let autoplayInterval;
    
    // 初始化轮转展示
    if (carousel && items.length > 0) {
        // 设置轮转展示
        function updateCarousel() {
            if (!carousel) return;
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
            // 更新活动点
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        // 点击下一个
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentIndex = (currentIndex + 1) % items.length;
                updateCarousel();
            });
        }
        
        // 点击上一个
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                updateCarousel();
            });
        }
        
        // 点击圆点导航
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentIndex = index;
                updateCarousel();
            });
        });
        
        // 自动轮播
        function startAutoplay() {
            if (autoplayInterval) clearInterval(autoplayInterval);
            autoplayInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % items.length;
                updateCarousel();
            }, 5000); // 每5秒切换一次
        }
        
        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }
        
        // 鼠标悬停时停止轮播
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        
        // 触摸设备支持
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoplay();
        }, { passive: true });
        
        carousel.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoplay();
        }, { passive: true });
        
        function handleSwipe() {
            const threshold = 50; // 最小滑动距离
            if (touchEndX + threshold < touchStartX) {
                // 向左滑动：下一个
                currentIndex = (currentIndex + 1) % items.length;
                updateCarousel();
            } else if (touchEndX > touchStartX + threshold) {
                // 向右滑动：上一个
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                updateCarousel();
            }
        }
        
        // 开始自动轮播
        startAutoplay();
    }
    
    // 滚动指示器
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // 滚动时显示/隐藏导航栏背景
    const header = document.querySelector('header');
    
    // 滚动效果
    const scrollContent = document.querySelector('.scrollable-content');
    
    // 页面滚动事件监听
    window.addEventListener('scroll', handleScroll);
    
    if (scrollContent) {
        scrollContent.addEventListener('scroll', handleScroll);
    }
    
    function handleScroll() {
        let scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        if (scrollContent) {
            scrollY = scrollContent.scrollTop;
        }
        
        // 导航栏背景透明度控制
        if (header && scrollY > 50) {
            header.classList.add('scrolled');
        } else if (header) {
            header.classList.remove('scrolled');
        }
        
        // 更新导航链接激活状态
        updateActiveLinks(scrollY);
    }
    
    function updateActiveLinks(scrollY) {
        // 获取当前滚动位置对应的部分
        if (!sections || !sections.length || !navLinks || !navLinks.length) return;
        
        let currentSectionIndex = 0;
        sections.forEach((section, index) => {
            if (!section) return;
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                currentSectionIndex = index;
            }
        });
        
        // 更新导航链接激活状态
        navLinks.forEach(link => {
            if (link) link.classList.remove('active');
        });
        
        if (navLinks[currentSectionIndex]) {
            navLinks[currentSectionIndex].classList.add('active');
        }
    }
    
    // 平滑滚动
    navLinks.forEach(link => {
        if (!link) return;
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (!targetId) return;
            
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                if (scrollContent) {
                    scrollContent.scrollTo({
                        top: targetSection.offsetTop,
                        behavior: 'smooth'
                    });
                } else {
                    window.scrollTo({
                        top: targetSection.offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                // 移动端菜单点击后关闭
                if (window.innerWidth < 768 && nav) {
                    nav.classList.remove('active');
                    if (menuToggle) menuToggle.classList.remove('active');
                }
            }
        });
    });
    
    // 数字计数动画
    const counters = document.querySelectorAll('.counter, .stat-number');
    
    // 检测IntersectionObserver API支持
    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    if (!counter) return;
                    
                    const target = parseInt(counter.getAttribute('data-count') || '0');
                    let suffix = '';
                    if (counter.nextElementSibling && counter.nextElementSibling.classList.contains('counter-suffix')) {
                        suffix = counter.nextElementSibling.textContent || '';
                    }
                    
                    animateCounter(counter, target, suffix);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            if (counter) counterObserver.observe(counter);
        });
    } else {
        // 降级处理：直接显示数值
        counters.forEach(counter => {
            if (!counter) return;
            const target = counter.getAttribute('data-count') || '0';
            const suffix = counter.nextElementSibling && counter.nextElementSibling.classList.contains('counter-suffix') 
                ? counter.nextElementSibling.textContent || '' 
                : '';
            counter.textContent = target + suffix;
        });
    }
    
    function animateCounter(counter, target, suffix) {
        let count = 0;
        const increment = target / 50; // 调整计数速度
        const duration = 1500; // 持续时间
        const interval = Math.max(10, Math.floor(duration / (target || 1)));
        
        const updateCount = () => {
            if (count < target) {
                count += increment;
                counter.textContent = Math.ceil(count) + suffix;
                setTimeout(updateCount, interval);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        updateCount();
    }
    
    // 过滤器功能
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        if (!btn) return;
        
        btn.addEventListener('click', function() {
            // 更新活跃按钮状态
            filterBtns.forEach(b => {
                if (b) b.classList.remove('active');
            });
            this.classList.add('active');
            
            // 过滤项目
            const filterValue = this.getAttribute('data-filter');
            if (!filterValue) return;
            
            galleryItems.forEach(item => {
                if (!item) return;
                
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // 视频模态框功能
    const videoItems = document.querySelectorAll('.dy-item');
    const videoModal = document.querySelector('.video-modal');
    const closeModal = document.querySelector('.close-modal');
    
    videoItems.forEach(item => {
        if (!item) return;
        
        item.addEventListener('click', function(e) {
            // 如果点击的是链接，不触发模态框
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            
            e.preventDefault();
            
            // 设置模态框内容
            const title = this.querySelector('.dy-title');
            if (videoModal && title) {
                const videoCaption = videoModal.querySelector('.video-caption h3');
                if (videoCaption) {
                    videoCaption.textContent = title.textContent;
                }
                
                // 显示模态框
                videoModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (videoModal) {
                videoModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // 点击模态框外部关闭
    if (videoModal) {
        videoModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // 添加标题悬停效果
    const headerLogo = document.querySelector('.header-logo-text');
    if (headerLogo) {
        headerLogo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        headerLogo.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // 预加载图片
    function preloadImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('data:')) {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'image';
                preloadLink.href = src;
                document.head.appendChild(preloadLink);
            }
        });
    }
    
    // 执行预加载
    setTimeout(preloadImages, 1000);
    
    // 初始化执行
    handleScroll();
});

// 全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error("JavaScript错误: ", message, "在", source, "的第", lineno, "行");
    return true; // 防止默认错误处理
}; 