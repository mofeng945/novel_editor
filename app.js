(() => {
    // 初始化Quill编辑器
    const quill = new Quill('#editor', { theme: 'snow', placeholder: '开始编写你的小说...', modules: { toolbar: false } });

    // 计算字数函数
    const countWords = (text) => {
        // 移除非文本内容（HTML标签等）
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
        return cleanText.length;
    };

    // 格式化字数显示（超过10000用w表示）
    const formatWordCount = (count) => {
        if (count >= 10000) {
            return (count / 10000).toFixed(1) + 'w';
        }
        return count.toString();
    };

    // 更新字数统计显示
    const updateWordCount = () => {
        // 计算当前章节字数
        const chapterContent = quill.root.innerHTML;
        const chapterWordCount = countWords(chapterContent);
        
        // 计算全书字数
        let totalWordCount = 0;
        if (state.chapters && state.chapters.length > 0) {
            state.chapters.forEach(chapter => {
                totalWordCount += countWords(chapter.content || '');
            });
        }
        
        // 更新DOM显示
        const chapterWordCountEl = document.getElementById('chapter-word-count');
        const totalWordCountEl = document.getElementById('total-word-count');
        
        if (chapterWordCountEl) {
            chapterWordCountEl.textContent = `本章：${formatWordCount(chapterWordCount)}`;
        }
        
        if (totalWordCountEl) {
            totalWordCountEl.textContent = `全书：${formatWordCount(totalWordCount)}`;
        }
    };

    // 监听内容变化，更新字数统计
    quill.on('text-change', updateWordCount);

    // DOM元素引用 - 使用更简洁的结构
    const els = {
        // 视图容器
        views: { bookshelf: document.getElementById('bookshelf-view'), editor: document.getElementById('editor-view') },
        // 书架相关
        bookshelf: { btn: document.getElementById('create-book-btn'), grid: document.getElementById('books-grid'), backBtn: document.getElementById('back-to-bookshelf-btn') },
        // 编辑相关
        editor: {
            status: document.getElementById('save-status'), btn: document.getElementById('save-btn'),
            exportBtn: document.getElementById('export-btn'), backupBtn: document.getElementById('backup-btn'),
            imgBtn: document.getElementById('insert-image-btn'),
            imgUpload: document.getElementById('image-upload'), chapters: document.getElementById('chapter-list'),
            newChapterName: document.getElementById('new-chapter-name'),
            createChapterBtn: document.getElementById('create-chapter-btn'),
        },
        // 备份相关
        backup: {
            modal: document.getElementById('backup-modal'),
            closeBtn: document.getElementById('close-backup-modal-btn'),
            createBackupBtn: document.getElementById('create-backup-btn'),
            restoreBackupInput: document.getElementById('restore-backup-input'),
            restoreBackupBtn: document.getElementById('restore-backup-btn'),
            closeModalBtn: document.getElementById('close-backup-btn'),
            autoBackupToggle: document.getElementById('auto-backup-toggle'),
            autoBackupFrequency: document.getElementById('auto-backup-frequency')
        },
        // 书籍信息相关
        bookInfo: {
            btn: document.getElementById('book-info-btn'), modal: document.getElementById('book-info-modal'),
            closeBtn: document.getElementById('close-modal-btn'), saveBtn: document.getElementById('save-book-info-btn'),
            cancelBtn: document.getElementById('cancel-book-info-btn'),
            titleInput: document.getElementById('book-title'),
            descInput: document.getElementById('book-description'),
            coverInput: document.getElementById('book-cover'),
            coverPreview: { container: document.getElementById('current-cover'), img: document.getElementById('cover-preview') },
            removeCoverBtn: document.getElementById('remove-cover-btn')
        },
        // 创建新作品相关
        createBook: {
            modal: document.getElementById('create-book-modal'),
            closeBtn: document.getElementById('close-create-book-modal-btn'),
            confirmBtn: document.getElementById('confirm-create-book-btn'),
            cancelBtn: document.getElementById('cancel-create-book-btn'),
            titleInput: document.getElementById('new-book-title'),
            descInput: document.getElementById('new-book-description'),
            coverInput: document.getElementById('new-book-cover')
        },
        // 导出设置相关
        export: {
            modal: document.getElementById('export-settings-modal'),
            closeBtn: document.getElementById('close-export-settings-modal-btn'),
            confirmBtn: document.getElementById('confirm-export-btn'),
            cancelBtn: document.getElementById('cancel-export-btn'),
            filename: document.getElementById('export-filename'),
            withTitle: document.getElementById('export-with-title'),
            withDesc: document.getElementById('export-with-description')
        },
        // 设置相关
        settings: {
            modal: document.getElementById('settings-modal'),
            closeBtn: document.getElementById('close-settings-modal-btn'),
            saveBtn: document.getElementById('save-settings-btn'),
            cancelBtn: document.getElementById('cancel-settings-btn'),
            themeRadios: document.querySelectorAll('input[name="theme-color"]'),
            layoutSelect: document.getElementById('card-layout'),
            customColorContainer: document.getElementById('custom-color-container'),
            customPrimaryColor: document.getElementById('custom-primary-color'),
            customHoverColor: document.getElementById('custom-hover-color'),
            backgroundType: document.getElementById('background-type'),
            backgroundImageContainer: document.getElementById('background-image-container'),
            backgroundImageUpload: document.getElementById('background-image-upload'),
            backgroundImagePreview: document.getElementById('background-image-preview'),
            previewBgImage: document.getElementById('preview-bg-image'),
            removeBgImageBtn: document.getElementById('remove-bg-image-btn'),
            solidBackgroundContainer: document.getElementById('solid-background-container'),
            backgroundColor: document.getElementById('background-color')
        }
    };

    // 添加设置按钮
    const createSettingsButton = (parentSelector, insertBeforeSelector = null) => {
        const parent = document.querySelector(parentSelector);
        
        // 检查父元素是否存在
        if (!parent) {
            console.warn(`无法找到父元素: ${parentSelector}`);
            return null;
        }
        
        const btn = document.createElement('button');
        btn.textContent = '设置';
        btn.id = insertBeforeSelector ? 'settings-btn-editor' : 'settings-btn';
        
        try {
            if (insertBeforeSelector) {
                const refNode = parent.querySelector(insertBeforeSelector);
                if (refNode) {
                    parent.insertBefore(btn, refNode);
                } else {
                    parent.appendChild(btn);
                }
            } else {
                parent.appendChild(btn);
            }
            return btn;
        } catch (error) {
            console.warn('创建设置按钮时出错:', error);
            return null;
        }
    };

    // 安全地创建设置按钮
    const settingsBtns = {
        bookshelf: null,
        editor: null
    };
    
    // 尝试创建书架视图的设置按钮
    try {
        settingsBtns.bookshelf = createSettingsButton('#bookshelf-view .header-actions');
    } catch (error) {
        console.warn('无法创建书架视图的设置按钮:', error);
    }
    
    // 尝试创建编辑器视图的设置按钮
    try {
        settingsBtns.editor = createSettingsButton('#editor-view .header-actions', '.export-options');
    } catch (error) {
        console.warn('无法创建编辑器视图的设置按钮:', error);
    }

    // 应用状态
    let state = {
        books: [],
        currentBookId: null,
        currentBook: null,
        chapters: [],
        currentChapterId: null,
        saveTimer: null,
        isRenaming: false,
        chapterBeingRenamed: null,
        settings: {
            themeColor: 'blue',
            cardLayout: 'grid',
            customColors: {
                primary: '#165DFF',
                hover: '#4080FF'
            },
            backgroundType: 'solid',
            backgroundColor: '#f5f5f5',
            backgroundImage: null
        }
    };

    // 备份功能相关函数
    const createBackup = async () => {
        try {
            // 确保所有数据已保存
            await saveBooks();
            await saveAppSettings();
            
            // 获取当前所有数据
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                books: state.books,
                settings: state.settings
            };
            
            // 创建备份文件
            const backupContent = JSON.stringify(backupData, null, 2);
            const blob = new Blob([backupContent], { type: 'application/json' });
            
            // 生成文件名
            const now = new Date();
            const filename = `novel_backup_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.novelbackup`;
            
            // 创建下载链接
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            
            // 更新最后备份时间
            state.settings.autoBackup = state.settings.autoBackup || {};
            state.settings.autoBackup.lastBackup = now.toISOString();
            await saveAppSettings();
            
            if (els.editor.status) {
                els.editor.status.textContent = '备份创建成功';
                els.editor.status.classList.add('saved');
                setTimeout(() => {
                    els.editor.status.textContent = '已保存';
                    els.editor.status.classList.remove('saved');
                }, 2000);
            }
            
            return true;
        } catch (error) {
            console.error('创建备份失败:', error);
            alert('创建备份失败，请稍后重试');
            return false;
        }
    };
    
    const restoreBackup = async (file) => {
        try {
            // 确认操作
            if (!confirm('恢复备份将覆盖当前所有数据，确定要继续吗？')) {
                return false;
            }
            
            // 读取文件
            const content = await file.text();
            const backupData = JSON.parse(content);
            
            // 验证备份文件
            if (!backupData.version || !backupData.books) {
                throw new Error('无效的备份文件');
            }
            
            // 恢复数据
            state.books = backupData.books || [];
            if (backupData.settings) {
                state.settings = backupData.settings;
            }
            
            // 保存恢复的数据
            await saveBooks();
            await saveAppSettings();
            
            // 刷新UI
            updateBooksGrid();
            applyAppSettings();
            
            // 更新自动备份设置UI
            if (els.backup.autoBackupToggle) {
                els.backup.autoBackupToggle.checked = state.settings.autoBackup?.enabled || false;
            }
            if (els.backup.autoBackupFrequency) {
                els.backup.autoBackupFrequency.value = state.settings.autoBackup?.frequency || 'daily';
            }
            
            if (els.editor.status) {
                els.editor.status.textContent = '备份恢复成功';
                els.editor.status.classList.add('saved');
                setTimeout(() => {
                    els.editor.status.textContent = '已保存';
                    els.editor.status.classList.remove('saved');
                }, 2000);
            }
            
            return true;
        } catch (error) {
            console.error('恢复备份失败:', error);
            alert('恢复备份失败，请确保选择了有效的备份文件');
            return false;
        }
    };
    
    const checkAutoBackup = async () => {
        // 如果自动备份未启用，直接返回
        if (!state.settings.autoBackup || !state.settings.autoBackup.enabled) {
            return;
        }
        
        const now = new Date();
        const lastBackup = state.settings.autoBackup.lastBackup ? new Date(state.settings.autoBackup.lastBackup) : null;
        const frequency = state.settings.autoBackup.frequency || 'daily';
        
        // 判断是否需要执行备份
        let shouldBackup = false;
        
        if (!lastBackup) {
            // 从未备份过，需要备份
            shouldBackup = true;
        } else {
            // 根据频率判断
            const diffMs = now - lastBackup;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            
            switch (frequency) {
                case 'daily':
                    shouldBackup = diffDays >= 1;
                    break;
                case 'weekly':
                    shouldBackup = diffDays >= 7;
                    break;
                case 'monthly':
                    shouldBackup = diffDays >= 30;
                    break;
            }
        }
        
        if (shouldBackup) {
            // 询问用户是否执行自动备份
            if (confirm('已到自动备份时间，是否创建备份？')) {
                await createBackup();
            }
        }
    };
    
    const openBackupModal = () => {
        if (els.backup.modal) {
            els.backup.modal.style.display = 'block';
        }
    };
    
    // 辅助函数 - 使用增强的存储管理（IndexedDB优先）
    const saveBooks = async () => {
        try {
            // 使用storageManager进行异步安全存储
            if (window.storageManager) {
                const success = await window.storageManager.safeSet('novelEditorBooks', state.books);
                if (!success) {
                    console.warn('存储失败但会使用后备机制');
                }
            } else {
                // 降级方案
                localStorage.setItem('novelEditorBooks', JSON.stringify(state.books));
            }
            return true;
        } catch (e) {
            console.error('书籍数据保存失败:', e);
            alert('警告：无法保存书籍数据，请检查浏览器存储空间是否充足。');
            return false;
        }
    };
    
    const loadBooks = async () => {
        try {
            if (window.storageManager) {
                const saved = await window.storageManager.safeGet('novelEditorBooks');
                state.books = saved || [];
            } else {
                // 降级方案
                const saved = localStorage.getItem('novelEditorBooks');
                state.books = saved ? JSON.parse(saved) : [];
            }
            return true;
        } catch (e) {
            console.error('解析书籍数据失败:', e);
            state.books = [];
            return false;
        }
    };

    const saveAppSettings = async () => {
        try {
            // 保存自动备份设置
            if (els.backup.autoBackupToggle && els.backup.autoBackupFrequency) {
                state.settings.autoBackup = state.settings.autoBackup || {};
                state.settings.autoBackup.enabled = els.backup.autoBackupToggle.checked;
                state.settings.autoBackup.frequency = els.backup.autoBackupFrequency.value;
            }
            
            if (window.storageManager) {
                const success = await window.storageManager.safeSet('novelEditorSettings', state.settings);
                if (!success) {
                    console.warn('存储失败但会使用后备机制');
                }
            } else {
                // 降级方案
                localStorage.setItem('novelEditorSettings', JSON.stringify(state.settings));
            }
            applyAppSettings();
            return true;
        } catch (e) {
            console.error('设置保存失败:', e);
            applyAppSettings(); // 即使保存失败，仍应用当前设置
            return false;
        }
    };

    const loadAppSettings = async () => {
        try {
            if (window.storageManager) {
                const saved = await window.storageManager.safeGet('novelEditorSettings');
                if (saved) {
                    state.settings = saved;
                }
            } else {
                // 降级方案
                const saved = localStorage.getItem('novelEditorSettings');
                if (saved) state.settings = JSON.parse(saved);
            }
            
            // 初始化自动备份设置
            if (!state.settings.autoBackup) {
                state.settings.autoBackup = {
                    enabled: false,
                    frequency: 'daily',
                    lastBackup: null
                };
            }
            
            // 应用自动备份设置到UI
            if (els.backup.autoBackupToggle) {
                els.backup.autoBackupToggle.checked = state.settings.autoBackup.enabled;
            }
            if (els.backup.autoBackupFrequency && state.settings.autoBackup.frequency) {
                els.backup.autoBackupFrequency.value = state.settings.autoBackup.frequency;
            }
            
            applyAppSettings();
            
            // 检查是否需要自动备份
            checkAutoBackup();
            
            return true;
        } catch (e) {
            console.error('解析设置数据失败:', e);
            applyAppSettings(); // 应用默认设置
            return false;
        }
    };

    // 应用设置
    const applyAppSettings = () => {
        // 应用主题颜色
        document.body.className = '';
        
        // 移除任何自定义样式元素
        const customStyle = document.getElementById('custom-theme-styles');
        if (customStyle) {
            customStyle.remove();
        }
        
        if (state.settings.themeColor === 'custom' && state.settings.customColors) {
            // 创建自定义样式
            const styleElement = document.createElement('style');
            styleElement.id = 'custom-theme-styles';
            styleElement.textContent = `
                :root {
                    --primary-color: ${state.settings.customColors.primary} !important;
                    --primary-hover: ${state.settings.customColors.hover} !important;
                    --primary-light: ${lightenColor(state.settings.customColors.primary, 80)} !important;
                    --header-gradient-start: ${state.settings.customColors.primary} !important;
                    --header-gradient-end: ${state.settings.customColors.hover} !important;
                }
            `;
            document.head.appendChild(styleElement);
        } else if (state.settings.themeColor !== 'default') {
            document.body.classList.add(`theme-${state.settings.themeColor}`);
        }
        
        // 应用卡片布局
        els.bookshelf.grid.classList.toggle('list-view', state.settings.cardLayout === 'list');
        
        // 应用背景设置
        if (state.settings.backgroundType === 'image' && state.settings.backgroundImage) {
            document.body.style.backgroundImage = `url(${state.settings.backgroundImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundColor = 'transparent';
        } else {
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = state.settings.backgroundColor || '#f5f5f5';
        }
    };
    
    // 辅助函数：使颜色变亮
    const lightenColor = (color, percent) => {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);
        
        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);
        
        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;
        
        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);
        
        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));
        
        return `#${RR}${GG}${BB}`;
    };

    // 书籍管理函数
    const createNewBook = async (title, description = '', coverImage = null) => {
        const newBook = {
            id: Date.now().toString(),
            title,
            description,
            coverImage,
            chapters: []
        };
        state.books.unshift(newBook);
        await saveBooks();
        updateBooksGrid();
        return newBook.id;
    };

    const selectBook = (bookId) => {
        state.currentBookId = bookId;
        state.currentBook = state.books.find(book => book.id === bookId);
        state.chapters = state.currentBook.chapters || [];
        state.currentChapterId = null;
        updateChaptersList();
        els.views.bookshelf.style.display = 'none';
        els.views.editor.style.display = 'block';
        els.editor.status.textContent = '已保存';
        
        // 更新字数统计显示
        updateWordCount();

    };

    const updateBookInfo = async (title, description, coverImage = undefined) => {
        if (!state.currentBook) return;
        state.currentBook.title = title;
        state.currentBook.description = description;
        if (coverImage !== undefined) state.currentBook.coverImage = coverImage;
        await saveBooks();
    };

    // 章节管理函数
    const createNewChapter = (name) => {
        const newChapter = {
            id: Date.now().toString(),
            name,
            content: ''
        };
        state.chapters.push(newChapter);
        saveChaptersToBook();
        updateChaptersList();
        return newChapter.id;
    };

    const loadChapter = (chapterId) => {
        saveCurrentChapter();
        state.currentChapterId = chapterId;
        const chapter = state.chapters.find(c => c.id === chapterId);
        if (chapter) {
            quill.root.innerHTML = chapter.content || '';
            els.editor.status.textContent = '已保存';
            els.editor.status.style.color = '';
            // 更新字数统计
            updateWordCount();
        }
        // 高亮当前章节
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === chapterId);
        });

    };

    const saveCurrentChapter = () => {
        if (!state.currentChapterId) return;
        const chapter = state.chapters.find(c => c.id === state.currentChapterId);
        if (chapter) {
            chapter.content = quill.root.innerHTML;
            saveChaptersToBook();
            els.editor.status.textContent = '已保存';
            els.editor.status.style.color = '';
        }
    };

    const saveChaptersToBook = async () => {
        if (!state.currentBook) return;
        state.currentBook.chapters = state.chapters;
        await saveBooks();
    };

    const renameChapter = (chapterId, newName) => {
        const chapter = state.chapters.find(c => c.id === chapterId);
        if (chapter) {
            chapter.name = newName;
            saveChaptersToBook();
            updateChaptersList();
        }
    };

    // 图片懒加载初始化函数
    const initLazyLoading = () => {
        // 图片加载完成后添加loaded类
        const handleImageLoad = (img) => {
            img.classList.add('loaded');
        };
        
        if ('IntersectionObserver' in window) {
            const imgObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        // 设置图片加载完成事件
                        img.onload = () => handleImageLoad(img);
                        img.onerror = () => handleImageLoad(img); // 加载失败也显示占位符
                        
                        // 替换data-src到src
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        // 解除观察
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '0px 0px 50px 0px', // 提前50px触发加载
                threshold: 0.1
            });
            
            // 观察所有带有data-src的图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imgObserver.observe(img);
            });
        } else {
            // 降级方案：直接加载所有图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.onload = () => handleImageLoad(img);
                img.onerror = () => handleImageLoad(img);
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    };
    
    // UI更新函数
    const updateBooksGrid = () => {
        els.bookshelf.grid.innerHTML = '';
        if (state.books.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>还没有创建任何作品</p><p>点击"创建新作品"开始写作之旅</p>';
            els.bookshelf.grid.appendChild(emptyState);
            return;
        }
        state.books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <div class="book-cover">
                    <img 
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23f0f0f0' stroke-width='2'%3E%3Cpath d='M769 229L1037 439L837 573L673 439L769 229Z'/%3E%3Cpath d='M500 359L1037 439L837 573L500 359Z'/%3E%3Cpath d='M231 229L500 359L336 439L40 573L231 229Z'/%3E%3Cpath d='M40 573L500 359L336 439L40 573Z'/%3E%3Cpath d='M40 573L299 693L500 573L336 439L40 573Z'/%3E%3Cpath d='M500 573L701 693L40 573L40 573.1L500 573Z'/%3E%3Cpath d='M769 771L299 693L500 573L701 693L769 771Z'/%3E%3Cpath d='M769 229L231 229L336 439L673 439L769 229Z'/%3E%3C/g%3E%3C/svg%3E" 
                        data-src="${book.coverImage || 'NoEnvelop.png'}"
                        alt="${book.title}"
                        class="lazy-load-image"
                    >
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="book-description">${book.description || '暂无简介'}</p>
                    <div class="book-meta">
                        <span>章节: ${book.chapters?.length || 0}</span>
                    </div>
                    <div class="book-actions">
                        <button class="edit-btn" data-id="${book.id}">编辑</button>
                        <button class="delete-btn" data-id="${book.id}">删除</button>
                    </div>
                </div>
            `;
            els.bookshelf.grid.appendChild(bookCard);
        });
        
        // 初始化懒加载
        initLazyLoading();
        // 添加事件监听
        document.querySelectorAll('.book-card .edit-btn').forEach(btn => {
            btn.addEventListener('click', () => selectBook(btn.dataset.id));
        });
        document.querySelectorAll('.book-card .delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('确定要删除这部作品吗？')) {
                    state.books = state.books.filter(book => book.id !== btn.dataset.id);
                    await saveBooks();
                    updateBooksGrid();
                }
            });
        });
    };

    // 章节拖放操作
    let draggedChapter = null;
    let dragOverIndex = -1;

    // 更新章节列表函数
    const updateChaptersList = () => {
        els.editor.chapters.innerHTML = '';
        state.chapters.forEach((chapter, index) => {
            const chapterItem = document.createElement('div');
            chapterItem.className = `chapter-item ${chapter.id === state.currentChapterId ? 'active' : ''}`;
            chapterItem.dataset.id = chapter.id;
            chapterItem.dataset.index = index;
            chapterItem.innerHTML = `
                <div class="chapter-handle">⋮⋮</div>
                <div class="chapter-name">${chapter.name}</div>
                <div class="chapter-actions">
                    <button class="rename-btn">重命名</button>
                    <button class="delete-btn">删除</button>
                </div>
            `;
            // 添加拖放属性
            chapterItem.setAttribute('draggable', 'true');
            els.editor.chapters.appendChild(chapterItem);
        });
        // 添加事件监听
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.addEventListener('click', () => loadChapter(item.dataset.id));
            
            // 拖放事件监听
            item.addEventListener('dragstart', (e) => {
                draggedChapter = item;
                setTimeout(() => item.classList.add('dragging'), 0);
                e.dataTransfer.effectAllowed = 'move';
            });
            
            item.addEventListener('dragend', () => {
                draggedChapter = null;
                dragOverIndex = -1;
                document.querySelectorAll('.chapter-item').forEach(ch => ch.classList.remove('dragging', 'drag-over'));
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // 移除其他元素的drag-over类
                document.querySelectorAll('.chapter-item').forEach(ch => ch.classList.remove('drag-over'));
                
                // 为当前悬停的元素添加drag-over类
                item.classList.add('drag-over');
                dragOverIndex = parseInt(item.dataset.index);
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                
                if (draggedChapter && draggedChapter !== item) {
                    const draggedIndex = parseInt(draggedChapter.dataset.index);
                    const dropIndex = parseInt(item.dataset.index);
                    
                    // 重新排列章节数组
                    const newChapters = [...state.chapters];
                    const [removed] = newChapters.splice(draggedIndex, 1);
                    newChapters.splice(dropIndex, 0, removed);
                    
                    // 更新状态
                    state.chapters = newChapters;
                    saveChaptersToBook();
                    updateChaptersList();
                }
                
                // 清理
                document.querySelectorAll('.chapter-item').forEach(ch => ch.classList.remove('dragging', 'drag-over'));
            });
        });
        
        document.querySelectorAll('.chapter-item .rename-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                startRenameChapter(btn.closest('.chapter-item').dataset.id);
            });
        });
        
        document.querySelectorAll('.chapter-item .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chapterId = btn.closest('.chapter-item').dataset.id;
                if (confirm('确定要删除这个章节吗？')) {
                    state.chapters = state.chapters.filter(c => c.id !== chapterId);
                    saveChaptersToBook();
                    updateChaptersList();
                    if (state.currentChapterId === chapterId) {
                        state.currentChapterId = state.chapters.length > 0 ? state.chapters[0].id : null;
                        quill.root.innerHTML = '';
                    }
                }
            });
        });
    };

    // 模态框管理函数
    const openSettingsModal = () => {
        // 设置主题颜色
        els.settings.themeRadios.forEach(radio => {
            radio.checked = radio.value === state.settings.themeColor;
        });
        
        // 更新自定义颜色区域显示状态
        els.settings.customColorContainer.style.display = state.settings.themeColor === 'custom' ? 'block' : 'none';
        
        // 设置自定义颜色值
        if (state.settings.customColors) {
            els.settings.customPrimaryColor.value = state.settings.customColors.primary || '#165DFF';
            els.settings.customHoverColor.value = state.settings.customColors.hover || '#4080FF';
        }
        
        // 设置卡片布局
        els.settings.layoutSelect.value = state.settings.cardLayout;
        
        // 设置背景类型和颜色
        els.settings.backgroundType.value = state.settings.backgroundType || 'solid';
        els.settings.backgroundColor.value = state.settings.backgroundColor || '#f5f5f5';
        
        // 更新背景容器显示状态
        els.settings.backgroundImageContainer.style.display = state.settings.backgroundType === 'image' ? 'block' : 'none';
        els.settings.solidBackgroundContainer.style.display = state.settings.backgroundType === 'solid' ? 'block' : 'none';
        
        // 显示背景图片预览
        if (state.settings.backgroundImage) {
            els.settings.previewBgImage.src = state.settings.backgroundImage;
            els.settings.backgroundImagePreview.style.display = 'block';
        } else {
            els.settings.backgroundImagePreview.style.display = 'none';
        }
        
        els.settings.modal.style.display = 'block';
    };

    const openExportSettings = () => {
        if (!state.currentBook) return;
        els.export.filename.value = state.currentBook.title || '我的小说';
        els.export.withTitle.checked = true;
        els.export.withDesc.checked = true;
        els.export.modal.style.display = 'block';
    };

    const executeExport = () => {
        try {
            if (!state.currentBook) return;
            const filename = els.export.filename.value.trim() || state.currentBook.title || '我的小说';
            const includeTitle = els.export.withTitle.checked;
            const includeDescription = els.export.withDesc.checked;
            const exportAllChapters = document.getElementById('export-all-chapters').checked;
            let textContent = '';
            
            if (includeTitle) textContent += `${state.currentBook.title || '我的小说'}\n\n`;
            if (includeDescription && state.currentBook.description) {
                textContent += `${state.currentBook.description}\n\n------------------------------------------\n\n`;
            }
            
            const chaptersToExport = exportAllChapters ? [...state.chapters] : 
                state.chapters.filter(chapter => chapter.id === state.currentChapterId);
            
            chaptersToExport.forEach((chapter, index) => {
                if (index > 0) textContent += '\n\n';
                textContent += `${chapter.name}\n\n`;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = chapter.content || '';
                Array.from(tempDiv.children).forEach(element => {
                    if (['H1', 'H2'].includes(element.tagName)) {
                        textContent += `${element.textContent}\n\n`;
                    } else if (element.tagName === 'P') {
                        textContent += `${element.textContent}\n\n`;
                    } else if (['UL', 'OL'].includes(element.tagName)) {
                        Array.from(element.querySelectorAll('li')).forEach((item, itemIndex) => {
                            const prefix = element.tagName === 'OL' ? `${itemIndex + 1}. ` : '• ';
                            textContent += `${prefix}${item.textContent}\n`;
                        });
                        textContent += '\n';
                    } else if (element.tagName === 'BLOCKQUOTE') {
                        element.textContent.split('\n').forEach(line => {
                            textContent += `> ${line}\n`;
                        });
                        textContent += '\n';
                    }
                });
            });
            
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, `${filename}.txt`);
            els.export.modal.style.display = 'none';
            showSaveMessage('TXT文件导出成功');
        } catch (error) {
            console.error('导出TXT失败:', error);
            alert('导出TXT文件时发生错误，请稍后再试。');
        }
    };

    // 辅助函数
    const showSaveMessage = (text, duration = 2000) => {
        els.editor.status.textContent = text;
        els.editor.status.classList.add('saved');
        setTimeout(() => {
            els.editor.status.textContent = '已保存';
            els.editor.status.classList.remove('saved');
        }, duration);
    };

    const startRenameChapter = (chapterId) => {
        const chapter = state.chapters.find(c => c.id === chapterId);
        if (chapter) {
            state.isRenaming = true;
            state.chapterBeingRenamed = chapterId;
            els.editor.newChapterName.value = chapter.name;
            els.editor.newChapterName.focus();

            // 添加视觉提示，告知用户按回车键确认重命名
            els.editor.newChapterName.setAttribute('placeholder', '修改章节名称后按回车键确认');
            els.editor.newChapterName.classList.add('renaming');
        }
    };

    const cancelRename = () => {
        state.isRenaming = false;
        state.chapterBeingRenamed = null;
        els.editor.newChapterName.value = '';

        // 移除视觉提示，恢复原始占位符文本
        els.editor.newChapterName.setAttribute('placeholder', '输入章节名称');
        els.editor.newChapterName.classList.remove('renaming');
    };

    // 为章节名称输入框添加回车事件监听（用于确认重命名）
    els.editor.newChapterName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && state.isRenaming && state.chapterBeingRenamed) {
            const chapterName = els.editor.newChapterName.value.trim();
            if (chapterName) {
                renameChapter(state.chapterBeingRenamed, chapterName);
                cancelRename();
            }
        }
    });

    const showBookshelf = () => {
        els.views.editor.style.display = 'none';
        els.views.bookshelf.style.display = 'block';
        updateBooksGrid();
    };

    // 事件监听设置
    const setupEvents = async () => {
        // 视图切换
        els.bookshelf.backBtn.addEventListener('click', () => {
            saveCurrentChapter();
            saveChaptersToBook();
            showBookshelf();
        });
        
        // 添加备份按钮事件
        if (els.editor.backupBtn) {
            els.editor.backupBtn.addEventListener('click', openBackupModal);
        }
        
        // 备份模态框事件
        if (els.backup.createBackupBtn) {
            els.backup.createBackupBtn.addEventListener('click', createBackup);
        }
        if (els.backup.restoreBackupBtn) {
            els.backup.restoreBackupBtn.addEventListener('click', () => {
                const file = els.backup.restoreBackupInput?.files[0];
                if (file) {
                    restoreBackup(file);
                    if (els.backup.restoreBackupInput) {
                        els.backup.restoreBackupInput.value = ''; // 清空文件选择
                    }
                } else {
                    alert('请选择要恢复的备份文件');
                }
            });
        }
        
        // 关闭备份模态框
        if (els.backup.closeBtn) {
            els.backup.closeBtn.addEventListener('click', () => {
                if (els.backup.modal) els.backup.modal.style.display = 'none';
            });
        }
        if (els.backup.closeModalBtn) {
            els.backup.closeModalBtn.addEventListener('click', () => {
                if (els.backup.modal) els.backup.modal.style.display = 'none';
            });
        }
        
        // 自动备份设置变更
        if (els.backup.autoBackupToggle) {
            els.backup.autoBackupToggle.addEventListener('change', async () => {
                state.settings.autoBackup = state.settings.autoBackup || {};
                state.settings.autoBackup.enabled = els.backup.autoBackupToggle.checked;
                await saveAppSettings();
            });
        }
        if (els.backup.autoBackupFrequency) {
            els.backup.autoBackupFrequency.addEventListener('change', async () => {
                state.settings.autoBackup = state.settings.autoBackup || {};
                state.settings.autoBackup.frequency = els.backup.autoBackupFrequency.value;
                await saveAppSettings();
            });
        }
        
        // 添加备份键盘快捷键
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                openBackupModal();
            }
        });
        
        // 重新添加视图切换事件（为了确保完整覆盖）
        els.bookshelf.backBtn.addEventListener('click', () => {
        });
        
        // 创建新作品
        els.bookshelf.btn.addEventListener('click', () => {
            els.createBook.titleInput.value = '';
            els.createBook.descInput.value = '';
            els.createBook.modal.style.display = 'block';
        });
        
        // 图片压缩函数
        const compressImage = (file, maxWidth = 600, maxHeight = 800, quality = 0.8) => {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
                    // 计算压缩后的尺寸
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round(height * maxWidth / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round(width * maxHeight / height);
                            height = maxHeight;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 压缩图片
                    canvas.toBlob((blob) => {
                        const reader = new FileReader();
                        reader.onload = e => resolve(e.target.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    }, 'image/jpeg', quality);
                };
                
                img.onerror = reject;
                img.src = URL.createObjectURL(file);
            });
        };
        
        // 确认创建新作品
        els.createBook.confirmBtn.addEventListener('click', async () => {
            const title = els.createBook.titleInput.value.trim();
            if (!title) return alert('请输入作品名称');
            
            const processCover = async (coverImage = null) => {
                const newBookId = await createNewBook(title, els.createBook.descInput.value.trim(), coverImage);
                els.createBook.modal.style.display = 'none';
                selectBook(newBookId);
                els.createBook.coverInput.value = '';
            };
            
            if (els.createBook.coverInput.files && els.createBook.coverInput.files[0]) {
                try {
                    const compressedImage = await compressImage(els.createBook.coverInput.files[0]);
                    processCover(compressedImage);
                } catch (error) {
                    console.error('图片压缩失败:', error);
                    // 压缩失败时使用原始图片
                    const reader = new FileReader();
                    reader.onload = e => processCover(e.target.result);
                    reader.readAsDataURL(els.createBook.coverInput.files[0]);
                }
            } else {
                processCover();
            }
        });
        
        // 书籍信息编辑
        els.bookInfo.btn.addEventListener('click', () => {
            if (!state.currentBook) return;
            els.bookInfo.titleInput.value = state.currentBook.title || '我的小说';
            els.bookInfo.descInput.value = state.currentBook.description || '';
            els.bookInfo.coverPreview.container.style.display = state.currentBook.coverImage ? 'flex' : 'none';
            if (state.currentBook.coverImage) els.bookInfo.coverPreview.img.src = state.currentBook.coverImage;
            els.bookInfo.coverInput.value = '';
            els.bookInfo.modal.style.display = 'block';
        });
        
        // 保存书籍信息
        els.bookInfo.saveBtn.addEventListener('click', async () => {
            if (!state.currentBook) return;
            const processCover = (coverImage = undefined) => {
                updateBookInfo(els.bookInfo.titleInput.value.trim() || '我的小说', els.bookInfo.descInput.value.trim(), coverImage);
                els.bookInfo.modal.style.display = 'none';
                updateBooksGrid();
                showSaveMessage('书籍信息已保存');
            };
            
            if (els.bookInfo.coverInput.files && els.bookInfo.coverInput.files[0]) {
                try {
                    const compressedImage = await compressImage(els.bookInfo.coverInput.files[0]);
                    processCover(compressedImage);
                } catch (error) {
                    console.error('图片压缩失败:', error);
                    // 压缩失败时使用原始图片
                    const reader = new FileReader();
                    reader.onload = e => processCover(e.target.result);
                    reader.readAsDataURL(els.bookInfo.coverInput.files[0]);
                }
            } else {
                processCover();
            }
        });
        
        // 移除封面
        els.bookInfo.removeCoverBtn.addEventListener('click', async () => {
            if (!state.currentBook) return;
            state.currentBook.coverImage = null;
            await saveBooks();
            els.bookInfo.coverPreview.container.style.display = 'none';
            els.bookInfo.coverInput.value = '';
        });
        
        // 定时保存
        quill.on('text-change', () => {
            if (!state.currentChapterId) return;
            const chapter = state.chapters.find(c => c.id === state.currentChapterId);
            if (chapter) {
                els.editor.status.textContent = `未保存: ${chapter.name}`;
                els.editor.status.style.color = '#ff9800';
            }
            clearTimeout(state.saveTimer);
            state.saveTimer = setTimeout(saveCurrentChapter, 30000);
        });
        
        // 手动保存
        els.editor.btn.addEventListener('click', saveCurrentChapter);
        
        // 章节管理
        els.editor.createChapterBtn.addEventListener('click', () => {
            const chapterName = els.editor.newChapterName.value.trim();
            if (!chapterName) return alert('请输入章节名称');
            
            // 只执行创建新章节操作，不处理重命名逻辑
            const newChapterId = createNewChapter(chapterName);
            loadChapter(newChapterId);
            els.editor.newChapterName.value = '';
        });
        

        
        document.addEventListener('click', e => {
            if (state.isRenaming && !e.target.closest('.chapter-actions')) {
                cancelRename();
            }
        });
        
        // 插入图片
        els.editor.imgBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const compressedBlob = await compressImage(file);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const range = quill.getSelection();
                            if (range) {
                                quill.insertEmbed(range.index, 'image', event.target.result);
                                quill.setSelection(range.index + 1);
                            } else {
                                quill.root.insertAdjacentHTML('beforeend', `<img src="${event.target.result}" />`);
                            }
                            saveCurrentChapter();
                            // 设置图片点击事件
                            setupImageClickEvents();
                        };
                        reader.readAsDataURL(compressedBlob);
                    } catch (error) {
                        console.error('图片压缩失败:', error);
                    }
                }
            };
            input.click();
        });

        // 设置图片点击事件
        const setupImageClickEvents = () => {
            document.querySelectorAll('#editor img').forEach(img => {
                img.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openImageEditModal(img);
                });
            });
        };

        // 图片编辑模态框
        let imageEditModal = null;
        let currentImage = null;

        // 创建图片编辑模态框
        const createImageEditModal = () => {
            if (imageEditModal) return;

            imageEditModal = document.createElement('div');
            imageEditModal.className = 'modal';
            imageEditModal.id = 'image-edit-modal';
            imageEditModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>编辑图片</h3>
                        <button id="close-image-edit-modal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="image-preview-container">
                            <img id="image-preview" src="" alt="预览" />
                        </div>
                        <div class="image-edit-options">
                            <div class="option-group">
                                <label for="image-width">宽度 (px):</label>
                                <input type="number" id="image-width" min="10" max="1000" />
                            </div>
                            <div class="option-group">
                                <label for="image-height">高度 (px):</label>
                                <input type="number" id="image-height" min="10" max="1000" />
                            </div>
                            <div class="option-group">
                                <label for="image-wrap">文字环绕方式:</label>
                                <select id="image-wrap">
                                    <option value="none">无环绕</option>
                                    <option value="left">左浮动</option>
                                    <option value="right">右浮动</option>
                                    <option value="center">居中</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-image-edit" class="btn btn-secondary">取消</button>
                        <button id="save-image-edit" class="btn btn-primary">保存</button>
                    </div>
                </div>
            `;
            document.body.appendChild(imageEditModal);

            // 添加事件监听
            document.getElementById('close-image-edit-modal').addEventListener('click', closeImageEditModal);
            document.getElementById('cancel-image-edit').addEventListener('click', closeImageEditModal);
            document.getElementById('save-image-edit').addEventListener('click', saveImageEdit);

            // 关闭模态框当点击外部
            imageEditModal.addEventListener('click', (e) => {
                if (e.target === imageEditModal) closeImageEditModal();
            });

            // 同步宽高比例
            const widthInput = document.getElementById('image-width');
            const heightInput = document.getElementById('image-height');
            let aspectRatio = 1;

            widthInput.addEventListener('change', () => {
                if (currentImage) {
                    const width = parseInt(widthInput.value);
                    if (!isNaN(width)) {
                        heightInput.value = Math.round(width / aspectRatio);
                    }
                }
            });

            heightInput.addEventListener('change', () => {
                if (currentImage) {
                    const height = parseInt(heightInput.value);
                    if (!isNaN(height)) {
                        widthInput.value = Math.round(height * aspectRatio);
                    }
                }
            });

            // 更新aspectRatio函数
            window.updateImageAspectRatio = (width, height) => {
                aspectRatio = width / height;
            };
        };

        // 打开图片编辑模态框
        const openImageEditModal = (img) => {
            createImageEditModal();
            currentImage = img;

            const previewImg = document.getElementById('image-preview');
            const widthInput = document.getElementById('image-width');
            const heightInput = document.getElementById('image-height');
            const wrapSelect = document.getElementById('image-wrap');

            previewImg.src = img.src;
            
            // 获取原始尺寸
            const imgNatural = new Image();
            imgNatural.src = img.src;
            imgNatural.onload = () => {
                // 如果图片已有设置的尺寸，使用设置的尺寸
                const imgWidth = img.style.width ? parseInt(img.style.width) : imgNatural.width;
                const imgHeight = img.style.height ? parseInt(img.style.height) : imgNatural.height;
                
                widthInput.value = imgWidth;
                heightInput.value = imgHeight;
                window.updateImageAspectRatio(imgNatural.width, imgNatural.height);
            };

            // 设置文字环绕方式
            const floatStyle = img.style.float;
            if (floatStyle === 'left') {
                wrapSelect.value = 'left';
            } else if (floatStyle === 'right') {
                wrapSelect.value = 'right';
            } else if (img.style.display === 'block' && img.style.marginLeft === 'auto' && img.style.marginRight === 'auto') {
                wrapSelect.value = 'center';
            } else {
                wrapSelect.value = 'none';
            }

            imageEditModal.style.display = 'flex';
        };

        // 关闭图片编辑模态框
        const closeImageEditModal = () => {
            if (imageEditModal) {
                imageEditModal.style.display = 'none';
                currentImage = null;
            }
        };

        // 保存图片编辑
        const saveImageEdit = () => {
            if (!currentImage) return;

            const widthInput = document.getElementById('image-width');
            const heightInput = document.getElementById('image-height');
            const wrapSelect = document.getElementById('image-wrap');

            const width = parseInt(widthInput.value);
            const height = parseInt(heightInput.value);
            const wrapStyle = wrapSelect.value;

            if (!isNaN(width) && !isNaN(height)) {
                currentImage.style.width = `${width}px`;
                currentImage.style.height = `${height}px`;
            }

            // 设置文字环绕方式
            currentImage.style.float = '';
            currentImage.style.display = '';
            currentImage.style.marginLeft = '';
            currentImage.style.marginRight = '';

            switch (wrapStyle) {
                case 'left':
                    currentImage.style.float = 'left';
                    currentImage.style.marginRight = '10px';
                    break;
                case 'right':
                    currentImage.style.float = 'right';
                    currentImage.style.marginLeft = '10px';
                    break;
                case 'center':
                    currentImage.style.display = 'block';
                    currentImage.style.marginLeft = 'auto';
                    currentImage.style.marginRight = 'auto';
                    break;
                case 'none':
                default:
                    // 默认样式
                    break;
            }

            saveCurrentChapter();
            closeImageEditModal();
        };
        
        // 导出功能
        els.editor.exportBtn.addEventListener('click', openExportSettings);
        els.export.confirmBtn.addEventListener('click', executeExport);
        
        // 设置功能
        settingsBtns.bookshelf.addEventListener('click', openSettingsModal);
        settingsBtns.editor.addEventListener('click', openSettingsModal);
        
        els.settings.saveBtn.addEventListener('click', async () => {
            let selectedTheme = 'default';
            els.settings.themeRadios.forEach(radio => {
                if (radio.checked) selectedTheme = radio.value;
            });
            
            // 保存主题颜色
            state.settings.themeColor = selectedTheme;
            
            // 保存自定义颜色
            if (state.settings.themeColor === 'custom') {
                state.settings.customColors = {
                    primary: els.settings.customPrimaryColor.value,
                    hover: els.settings.customHoverColor.value
                };
            }
            
            // 保存卡片布局
            state.settings.cardLayout = els.settings.layoutSelect.value;
            
            // 保存背景设置
            state.settings.backgroundType = els.settings.backgroundType.value;
            
            if (state.settings.backgroundType === 'solid') {
                state.settings.backgroundColor = els.settings.backgroundColor.value;
            }
            
            await saveAppSettings();
            updateBooksGrid();
            els.settings.modal.style.display = 'none';
            
            if (els.views.bookshelf.style.display === 'block') {
                const tempMessage = document.createElement('div');
                tempMessage.className = 'temp-message';
                tempMessage.textContent = '设置已保存';
                Object.assign(tempMessage.style, {
                    position: 'fixed', top: '20px', right: '20px',
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    padding: '10px 20px', borderRadius: '4px', zIndex: '1000'
                });
                document.body.appendChild(tempMessage);
                setTimeout(() => tempMessage.remove(), 2000);
            }
        });
        
        // 事件监听 - 主题颜色变化
        els.settings.themeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'custom') {
                    els.settings.customColorContainer.style.display = 'block';
                } else {
                    els.settings.customColorContainer.style.display = 'none';
                }
            });
        });
        
        // 事件监听 - 背景类型变化
        els.settings.backgroundType.addEventListener('change', () => {
            const type = els.settings.backgroundType.value;
            els.settings.backgroundImageContainer.style.display = type === 'image' ? 'block' : 'none';
            els.settings.solidBackgroundContainer.style.display = type === 'solid' ? 'block' : 'none';
        });
        
        // 事件监听 - 背景图片上传
        els.settings.backgroundImageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    state.settings.backgroundImage = event.target.result;
                    els.settings.previewBgImage.src = event.target.result;
                    els.settings.backgroundImagePreview.style.display = 'block';
                    
                    // 清空文件输入，允许重复上传同一个文件
                    els.settings.backgroundImageUpload.value = '';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // 事件监听 - 移除背景图片
        els.settings.removeBgImageBtn.addEventListener('click', () => {
            state.settings.backgroundImage = null;
            els.settings.backgroundImagePreview.style.display = 'none';
        });
        
        // 关闭模态框事件
        const closeModalHandlers = [
            { btn: els.createBook.closeBtn, modal: els.createBook.modal },
            { btn: els.createBook.cancelBtn, modal: els.createBook.modal },
            { btn: els.bookInfo.closeBtn, modal: els.bookInfo.modal },
            { btn: els.bookInfo.cancelBtn, modal: els.bookInfo.modal },
            { btn: els.export.closeBtn, modal: els.export.modal },
            { btn: els.export.cancelBtn, modal: els.export.modal },
            { btn: els.settings.closeBtn, modal: els.settings.modal },
            { btn: els.settings.cancelBtn, modal: els.settings.modal }
        ];
        
        closeModalHandlers.forEach(item => {
            item.btn.addEventListener('click', () => item.modal.style.display = 'none');
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', e => {
            const modals = [els.createBook.modal, els.bookInfo.modal, els.export.modal, els.settings.modal];
            modals.forEach(modal => {
                if (e.target === modal) modal.style.display = 'none';
            });
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveCurrentChapter();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                openExportSettings();
            }
        });
        
        // 窗口关闭前提示
        window.addEventListener('beforeunload', e => {
            if (els.editor.status.textContent.includes('未保存')) {
                e.preventDefault();
                e.returnValue = '你有未保存的内容，确定要离开吗？';
                return '你有未保存的内容，确定要离开吗？';
            }
        });
        
        // 工具栏按钮
        document.querySelectorAll('.tool-btn[data-command]').forEach(button => {
            button.addEventListener('click', function() {
                const command = this.dataset.command;
                const value = this.dataset.value || null;
                
                if (command === 'formatBlock') {
                    quill.format('header', value === 'h1' ? 1 : value === 'h2' ? 2 : false);
                } else if (command === 'bold') {
                    quill.format('bold', !quill.getFormat().bold);
                } else if (command === 'italic') {
                    quill.format('italic', !quill.getFormat().italic);
                } else if (command === 'underline') {
                    quill.format('underline', !quill.getFormat().underline);
                } else if (command === 'insertUnorderedList') {
                    quill.format('list', quill.getFormat().list === 'bullet' ? false : 'bullet');
                } else if (command === 'insertOrderedList') {
                    quill.format('list', quill.getFormat().list === 'ordered' ? false : 'ordered');
                } else if (command === 'blockquote') {
                    quill.format('blockquote', !quill.getFormat().blockquote);
                }
            });
        });

        // 图片插入功能
        if (els.editor.imgBtn && els.editor.imgUpload) {
            // 防止重复点击 - 使用更可靠的方法
            let isProcessing = false;
            
            els.editor.imgBtn.addEventListener('click', function() {
                if (!isProcessing) {
                    isProcessing = true;
                    // 直接触发文件选择，不使用多层嵌套的setTimeout
                    els.editor.imgUpload.click();
                    // 重置状态，确保下次点击能正常工作
                    setTimeout(() => isProcessing = false, 300);
                }
            });

            els.editor.imgUpload.addEventListener('change', function(e) {
                // 立即重置处理状态，因为文件对话框已经关闭
                isProcessing = false;
                
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    const file = e.target.files[0];
                    
                    reader.onload = function(event) {
                        const range = quill.getSelection();
                        
                        if (range) {
                            // 如果有选择位置，插入到选择位置
                            quill.insertEmbed(range.index, 'image', reader.result);
                            // 移动光标到图片后面
                            quill.setSelection(range.index + 1);
                        } else {
                            // 如果没有选择位置，默认插入到章节末尾
                            const length = quill.getLength();
                            quill.insertEmbed(length - 1, 'image', reader.result);
                            quill.setSelection(length);
                        }
                        
                        // 保存章节内容
                        if (typeof saveCurrentChapter === 'function') {
                            saveCurrentChapter();
                        }
                        
                        // 设置图片点击事件，允许编辑图片
                        if (typeof setupImageClickEvents === 'function') {
                            setupImageClickEvents();
                        }
                        
                        // 只有在读取完成后才清空输入框
                        els.editor.imgUpload.value = '';
                    };
                    
                    // 处理读取错误
                    reader.onerror = function() {
                        console.error('图片读取失败');
                        els.editor.imgUpload.value = '';
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // 特殊符号折叠面板交互
        const toggleBtn = document.getElementById('toggle-special-chars');
        const contentPanel = document.getElementById('special-chars-content');
        
        if (toggleBtn && contentPanel) {
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 防止事件冒泡
                
                // 切换面板显示/隐藏
                contentPanel.classList.toggle('show');
                
                // 更新按钮文本中的箭头
                if (contentPanel.classList.contains('show')) {
                    toggleBtn.innerHTML = '特殊符号 ▲';
                } else {
                    toggleBtn.innerHTML = '特殊符号 ▼';
                }
            });
            
            // 特殊符号插入
            document.querySelectorAll('.tool-btn.special-char').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // 防止事件冒泡
                    
                    if (quill && quill.getSelection()) {
                        quill.insertText(quill.getSelection().index, this.dataset.char);
                    } else {
                        // 如果没有选择区域，尝试获取焦点并插入
                        quill.focus();
                        quill.insertText(quill.getLength(), this.dataset.char);
                    }
                });
            });
            
            // 点击页面其他地方关闭特殊符号面板
            document.addEventListener('click', function(e) {
                // 检查点击事件是否发生在面板或切换按钮之外
                if (toggleBtn && contentPanel && 
                    !toggleBtn.contains(e.target) && 
                    !contentPanel.contains(e.target) && 
                    contentPanel.classList.contains('show')) {
                    
                    // 关闭面板
                    contentPanel.classList.remove('show');
                    toggleBtn.innerHTML = '特殊符号 ▼';
                }
            });
        }
    };

    // 初始化应用 - 支持异步存储操作
    const initApp = async () => {
        try {
            // 等待storageManager初始化完成
            if (window.storageManager && !window.storageManager.db) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // 异步加载书籍数据
            await loadBooks();
            
            // 异步加载并应用设置
            await loadAppSettings();
            
            // 更新UI
            updateBooksGrid();
            
            // 设置事件监听
            await setupEvents();
            
            // 初始化字数统计
            if (typeof updateWordCount === 'function') {
                updateWordCount();
            }
            
            console.log('应用初始化成功，使用增强存储机制');
        } catch (error) {
            console.error('应用初始化失败:', error);
            // 尝试基本恢复
            if (quill) {
                console.log('编辑器已成功初始化');
            }
            // 显示友好错误提示
            alert('应用初始化时发生错误，但仍将尝试以有限功能运行。建议刷新页面重试。');
        }
    };

    // 启动应用
    initApp();
})();