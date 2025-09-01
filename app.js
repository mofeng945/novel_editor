(() => {
    // 初始化Quill编辑器
    const quill = new Quill('#editor', { theme: 'snow', placeholder: '开始编写你的小说...', modules: { toolbar: false } });

    // DOM元素引用 - 使用更简洁的结构
    const els = {
        // 视图容器
        views: { bookshelf: document.getElementById('bookshelf-view'), editor: document.getElementById('editor-view') },
        // 书架相关
        bookshelf: { btn: document.getElementById('create-book-btn'), grid: document.getElementById('books-grid'), backBtn: document.getElementById('back-to-bookshelf-btn') },
        // 编辑相关
        editor: {
            status: document.getElementById('save-status'), btn: document.getElementById('save-btn'),
            exportBtn: document.getElementById('export-btn'), imgBtn: document.getElementById('insert-image-btn'),
            imgUpload: document.getElementById('image-upload'), chapters: document.getElementById('chapter-list'),
            newChapterName: document.getElementById('new-chapter-name'),
            createChapterBtn: document.getElementById('create-chapter-btn'),
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
        const btn = document.createElement('button');
        btn.textContent = '设置';
        btn.id = insertBeforeSelector ? 'settings-btn-editor' : 'settings-btn';
        if (insertBeforeSelector) {
            const refNode = parent.querySelector(insertBeforeSelector);
            parent.insertBefore(btn, refNode);
        } else {
            parent.appendChild(btn);
        }
        return btn;
    };

    const settingsBtns = {
        bookshelf: createSettingsButton('#bookshelf-view .header-actions'),
        editor: createSettingsButton('#editor-view .header-actions', '.export-options')
    };

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

    // 辅助函数 - 保存/加载数据
    const saveBooks = () => localStorage.setItem('novelEditorBooks', JSON.stringify(state.books));
    const loadBooks = () => {
        const saved = localStorage.getItem('novelEditorBooks');
        state.books = saved ? JSON.parse(saved) : [];
    };

    const saveAppSettings = () => {
        localStorage.setItem('novelEditorSettings', JSON.stringify(state.settings));
        applyAppSettings();
    };

    const loadAppSettings = () => {
        const saved = localStorage.getItem('novelEditorSettings');
        if (saved) state.settings = JSON.parse(saved);
        applyAppSettings();
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
    const createNewBook = (title, description = '', coverImage = null) => {
        const newBook = {
            id: Date.now().toString(),
            title,
            description,
            coverImage,
            chapters: []
        };
        state.books.unshift(newBook);
        saveBooks();
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

    };

    const updateBookInfo = (title, description, coverImage = undefined) => {
        if (!state.currentBook) return;
        state.currentBook.title = title;
        state.currentBook.description = description;
        if (coverImage !== undefined) state.currentBook.coverImage = coverImage;
        saveBooks();
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

    const saveChaptersToBook = () => {
        if (!state.currentBook) return;
        state.currentBook.chapters = state.chapters;
        saveBooks();
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
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('确定要删除这部作品吗？')) {
                    state.books = state.books.filter(book => book.id !== btn.dataset.id);
                    saveBooks();
                    updateBooksGrid();
                }
            });
        });
    };

    const updateChaptersList = () => {
        els.editor.chapters.innerHTML = '';
        state.chapters.forEach(chapter => {
            const chapterItem = document.createElement('div');
            chapterItem.className = `chapter-item ${chapter.id === state.currentChapterId ? 'active' : ''}`;
            chapterItem.dataset.id = chapter.id;
            chapterItem.innerHTML = `
                <div class="chapter-name">${chapter.name}</div>
                <div class="chapter-actions">
                    <button class="rename-btn">重命名</button>
                    <button class="delete-btn">删除</button>
                </div>
            `;
            els.editor.chapters.appendChild(chapterItem);
        });
        // 添加事件监听
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.addEventListener('click', () => loadChapter(item.dataset.id));
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
    const setupEvents = () => {
        // 视图切换
        els.bookshelf.backBtn.addEventListener('click', () => {
            saveCurrentChapter();
            saveChaptersToBook();
            showBookshelf();
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
            
            const processCover = (coverImage = null) => {
                const newBookId = createNewBook(title, els.createBook.descInput.value.trim(), coverImage);
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
        els.bookInfo.removeCoverBtn.addEventListener('click', () => {
            if (!state.currentBook) return;
            state.currentBook.coverImage = null;
            saveBooks();
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
        els.editor.imgBtn.addEventListener('click', () => els.editor.imgUpload.click());
        els.editor.imgUpload.addEventListener('change', e => {
            if (!e.target.files || !e.target.files[0]) return;
            const reader = new FileReader();
            reader.onload = event => {
                const range = quill.getSelection();
                if (range) {
                    quill.insertEmbed(range.index, 'image', event.target.result);
                    quill.setSelection(range.index + 1);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        });
        
        // 导出功能
        els.editor.exportBtn.addEventListener('click', openExportSettings);
        els.export.confirmBtn.addEventListener('click', executeExport);
        
        // 设置功能
        settingsBtns.bookshelf.addEventListener('click', openSettingsModal);
        settingsBtns.editor.addEventListener('click', openSettingsModal);
        
        els.settings.saveBtn.addEventListener('click', () => {
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
            
            saveAppSettings();
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

    // 初始化应用
    const initApp = () => {
        // 加载书籍数据
        loadBooks();
        
        // 加载并应用设置
        loadAppSettings();
        
        // 更新UI
        updateBooksGrid();
        
        // 设置事件监听
        setupEvents();
        
        // 确保设置正确应用
        applyAppSettings();
    };

    initApp();
})();