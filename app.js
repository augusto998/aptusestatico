(function () {
  const STORAGE_KEY = 'aptus_front_v1';

  const defaultState = {
    session: null,
    users: [
      { id: 'u1', name: 'Lucas Mendes', email: 'lucas@aptus.com', password: 'Aptus@123', role: 'user', bio: 'Construindo hábitos melhores, um dia de cada vez.', city: 'Barra do Garças - MT' },
      { id: 'u2', name: 'Ana Clara', email: 'ana@aptus.com', password: 'Aptus@123', role: 'user', bio: 'Receitas fáceis e rotina leve.', city: 'Goiânia - GO' }
    ],
    nutritionists: [
      { id: 'n1', name: 'Dra. Marina Costa', email: 'marina@aptus.com', password: 'Aptus@123', role: 'nutritionist', specialty: 'Nutrição clínica e comportamento alimentar', crn: 'CRN 12345' },
      { id: 'n2', name: 'Dr. Rafael Lima', email: 'rafael@aptus.com', password: 'Aptus@123', role: 'nutritionist', specialty: 'Nutrição esportiva', crn: 'CRN 67890' }
    ],
    posts: [
      { id: 'p1', author: 'u2', type: 'reel', title: 'Bowl de iogurte com frutas', caption: 'Uma opção simples para o café da manhã 🍓', likes: 27, likedBy: [], comments: [{ author: 'Lucas Mendes', text: 'Vou testar amanhã!' }], tone: 'green' },
      { id: 'p2', author: 'n1', type: 'reel', title: 'Você precisa beber 3 litros?', caption: 'Necessidades variam. O importante é olhar para sua rotina e sinais de sede.', likes: 41, likedBy: [], comments: [{ author: 'Ana Clara', text: 'Essa dica fez muito sentido.' }], tone: 'gold' },
      { id: 'p3', author: 'u1', type: 'reel', title: 'Marmita rápida para a semana', caption: 'Arroz, feijão, frango, legumes e uma fruta. Básico também pode funcionar.', likes: 18, likedBy: [], comments: [], tone: 'green' }
    ],
    recipes: [
      { id: 'r1', title: 'Bowl de iogurte e frutas', emoji: '🍓', time: '5 min', author: 'Ana Clara', ingredients: ['Iogurte natural', 'Banana', 'Morango', 'Aveia'], method: 'Monte em camadas e finalize com aveia.' },
      { id: 'r2', title: 'Marmita colorida', emoji: '🥗', time: '25 min', author: 'APTUS', ingredients: ['Arroz', 'Feijão', 'Frango', 'Brócolis', 'Cenoura'], method: 'Prepare os itens separadamente e monte em uma marmita.' },
      { id: 'r3', title: 'Omelete de legumes', emoji: '🍳', time: '10 min', author: 'Dra. Marina Costa', ingredients: ['2 ovos', 'Tomate', 'Cebola', 'Espinafre'], method: 'Bata os ovos, junte os legumes e cozinhe em frigideira antiaderente.' }
    ],
    messages: {
      n1: [
        { from: 'n1', text: 'Olá! Como posso te ajudar hoje?' },
        { from: 'u1', text: 'Queria organizar melhor minhas refeições.' }
      ]
    },
    consultations: [
      { id: 'c1', user: 'u1', nutritionist: 'n1', date: '2026-10-02', time: '15:00', status: 'Confirmada' }
    ]
  };

  const app = document.getElementById('app');
  let state = loadState();

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...clone(defaultState), ...JSON.parse(saved) } : clone(defaultState);
    } catch (_) {
      return clone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function initials(name) {
    return String(name || 'AP').split(' ').map(function (part) { return part[0]; }).slice(0, 2).join('').toUpperCase();
  }

  function currentAccount() {
    if (!state.session) return null;
    const list = state.session.role === 'nutritionist' ? state.nutritionists : state.users;
    return list.find(function (item) { return item.id === state.session.id; });
  }

  function toast(message) {
    const element = document.createElement('div');
    element.className = 'toast';
    element.textContent = message;
    document.body.appendChild(element);
    setTimeout(function () { element.remove(); }, 2600);
  }

  function navigate(page) {
    window.location.hash = page;
  }

  window.addEventListener('hashchange', render);

  function showAuth() {
    app.innerHTML = `
      <div class="auth-shell">
        <section class="auth-brand">
          <div class="brand-mark">A</div>
          <h1>APTUS</h1>
          <p>Uma rede social para transformar informação em hábitos sustentáveis — com receitas, comunidade e contato com nutricionistas.</p>
          <div style="margin-top:28px;display:flex;gap:8px;flex-wrap:wrap">
            <span class="chip" style="background:rgba(255,255,255,.15);color:#fff">Rede social</span>
            <span class="chip" style="background:rgba(255,255,255,.15);color:#fff">Receitas</span>
            <span class="chip" style="background:rgba(255,255,255,.15);color:#fff">Nutrição</span>
          </div>
        </section>
        <section class="auth-card">
          <div class="auth-tabs">
            <button id="userTab" class="active">Cliente / Usuário</button>
            <button id="nutritionistTab">Nutricionista</button>
          </div>
          <div id="authContent"></div>
        </section>
      </div>`;

    let mode = 'user';

    function paintAuth() {
      const isUser = mode === 'user';
      document.getElementById('authContent').innerHTML = `
        <h2 class="form-title">${isUser ? 'Entrar no APTUS' : 'Área do nutricionista'}</h2>
        <p class="form-subtitle">${isUser ? 'Acompanhe seu progresso e descubra novas ideias.' : 'Acesse seu painel profissional e converse com pacientes.'}</p>
        <form id="loginForm">
          <div class="field"><label>E-mail</label><input id="email" type="email" required placeholder="voce@email.com"></div>
          <div class="field"><label>Senha</label><input id="password" type="password" required placeholder="••••••••"></div>
          <button class="btn btn-primary btn-block" type="submit">Entrar</button>
        </form>
        <div style="margin-top:18px;padding:13px;border-radius:14px;background:var(--surface-2);font-size:12px;color:var(--muted)">
          <b>Demo:</b> ${isUser ? 'lucas@aptus.com / Aptus@123' : 'marina@aptus.com / Aptus@123'}
        </div>
        ${isUser ? '<button id="registerButton" class="btn btn-ghost btn-block" style="margin-top:10px">Criar conta</button>' : ''}`;

      document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const list = isUser ? state.users : state.nutritionists;
        const account = list.find(function (item) { return item.email === email && item.password === password; });
        if (!account) {
          toast('E-mail ou senha inválidos.');
          return;
        }
        state.session = { id: account.id, role: account.role };
        saveState();
        navigate(account.role === 'nutritionist' ? 'nutritionist' : 'home');
      });

      const registerButton = document.getElementById('registerButton');
      if (registerButton) registerButton.addEventListener('click', showRegister);
    }

    document.getElementById('userTab').addEventListener('click', function () {
      mode = 'user';
      document.getElementById('userTab').classList.add('active');
      document.getElementById('nutritionistTab').classList.remove('active');
      paintAuth();
    });

    document.getElementById('nutritionistTab').addEventListener('click', function () {
      mode = 'nutritionist';
      document.getElementById('nutritionistTab').classList.add('active');
      document.getElementById('userTab').classList.remove('active');
      paintAuth();
    });

    paintAuth();
  }

  function showRegister() {
    app.innerHTML = `
      <div class="auth-shell">
        <section class="auth-brand">
          <div class="brand-mark">A</div><h1>APTUS</h1>
          <p>Crie seu perfil e faça parte da comunidade.</p>
        </section>
        <section class="auth-card">
          <button class="btn btn-ghost" id="backToLogin">← Voltar</button>
          <h2 class="form-title" style="margin-top:8px">Criar conta</h2>
          <p class="form-subtitle">Cadastro demonstrativo da versão GitHub Pages.</p>
          <form id="registerForm">
            <div class="field"><label>Nome</label><input id="registerName" required></div>
            <div class="field"><label>E-mail</label><input id="registerEmail" type="email" required></div>
            <div class="field"><label>Senha</label><input id="registerPassword" type="password" minlength="6" required></div>
            <div class="field"><label>Bio</label><textarea id="registerBio" rows="3" placeholder="Conte um pouco sobre você"></textarea></div>
            <button class="btn btn-primary btn-block">Criar e entrar</button>
          </form>
        </section>
      </div>`;

    document.getElementById('backToLogin').addEventListener('click', showAuth);
    document.getElementById('registerForm').addEventListener('submit', function (event) {
      event.preventDefault();
      const email = document.getElementById('registerEmail').value.trim().toLowerCase();
      if (state.users.some(function (user) { return user.email === email; })) {
        toast('Esse e-mail já está cadastrado.');
        return;
      }
      const user = {
        id: 'u' + Date.now(),
        name: document.getElementById('registerName').value.trim(),
        email: email,
        password: document.getElementById('registerPassword').value,
        role: 'user',
        bio: document.getElementById('registerBio').value.trim() || 'Novo membro do APTUS.',
        city: 'Brasil'
      };
      state.users.push(user);
      state.session = { id: user.id, role: 'user' };
      saveState();
      navigate('home');
    });
  }

  function appShell(page, title, content) {
    const account = currentAccount();
    const isNutri = state.session.role === 'nutritionist';
    const items = isNutri
      ? [['nutritionist', '▦', 'Painel'], ['social', '✦', 'Conteúdos'], ['messages', '◌', 'Mensagens']]
      : [['home', '⌂', 'Início'], ['social', '✦', 'Descobrir'], ['nutrition', '♡', 'Nutricionista']];

    const navButtons = items.map(function (item) {
      return `<button data-nav="${item[0]}" class="${page === item[0] ? 'active' : ''}"><span>${item[1]}</span>${item[2]}</button>`;
    }).join('');

    app.innerHTML = `
      <div class="app-shell">
        <div class="app">
          <aside class="sidebar">
            <div class="brand"><div class="brand-icon">A</div><strong>APTUS</strong></div>
            <nav class="nav">${navButtons}</nav>
            <div class="side-footer">
              <div class="mini-user">
                <div class="avatar">${initials(account.name)}</div>
                <div style="min-width:0"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(account.name)}</b><span class="muted" style="font-size:12px">${isNutri ? 'Nutricionista' : 'Cliente'}</span></div>
              </div>
              <button id="logoutButton" class="btn btn-ghost" style="width:100%;margin-top:10px">Sair</button>
            </div>
          </aside>
          <main class="main">
            <header class="topbar"><h2>${title}</h2><div class="top-actions"><button id="todayButton" class="btn btn-secondary hide-sm">Hoje</button><div class="avatar">${initials(account.name)}</div></div></header>
            <section class="content">${content}</section>
          </main>
        </div>
        <nav class="mobile-nav">${navButtons}</nav>
      </div>`;

    document.querySelectorAll('[data-nav]').forEach(function (button) {
      button.addEventListener('click', function () { navigate(button.dataset.nav); });
    });
    document.getElementById('logoutButton').addEventListener('click', function () {
      state.session = null;
      saveState();
      window.location.hash = '';
      showAuth();
    });
  }

  function recipeCard(recipe) {
    return `
      <article class="recipe-card">
        <div class="recipe-cover">${recipe.emoji}</div>
        <div class="recipe-body">
          <span class="chip">${escapeHtml(recipe.time)}</span>
          <h4>${escapeHtml(recipe.title)}</h4>
          <p>${escapeHtml(recipe.ingredients.slice(0, 3).join(' • '))}</p>
          <button class="btn btn-secondary" data-recipe="${recipe.id}">Ver receita</button>
        </div>
      </article>`;
  }

  function postCard(post, compact) {
    const author = state.users.find(function (user) { return user.id === post.author; }) || state.nutritionists.find(function (nutri) { return nutri.id === post.author; }) || { name: 'APTUS' };
    const liked = (post.likedBy || []).includes(state.session.id);
    return `
      <article class="card post">
        <div class="post-head">
          <div class="post-user"><div class="avatar">${initials(author.name)}</div><div><b>${escapeHtml(author.name)}</b><div class="muted" style="font-size:12px">${author.role === 'nutritionist' ? 'Nutricionista' : 'Comunidade APTUS'}</div></div></div>
          ${compact ? '' : '<button class="icon-btn">•••</button>'}
        </div>
        <div class="post-media ${post.tone === 'gold' ? 'alt' : ''}">
          <span class="reel-badge">REEL • APTUS</span>
          <div style="font-size:64px;opacity:.94">${post.tone === 'gold' ? '🥗' : '🍓'}</div>
          <div class="post-overlay"><h3>${escapeHtml(post.title)}</h3><div>${escapeHtml(post.caption)}</div></div>
        </div>
        <div class="post-actions">
          <button class="icon-btn ${liked ? 'liked' : ''}" data-like="${post.id}">♥ ${post.likes}</button>
          <button class="icon-btn">💬 ${post.comments ? post.comments.length : 0}</button>
          <button class="icon-btn" data-share="${post.id}">↗ Compartilhar</button>
        </div>
        <div class="comments" id="comments-${post.id}">
          ${(post.comments || []).slice(-3).map(function (comment) { return `<div class="comment"><b>${escapeHtml(comment.author)}</b>${escapeHtml(comment.text)}</div>`; }).join('')}
          <div style="display:flex;gap:8px"><input data-comment-input="${post.id}" placeholder="Escreva um comentário…" style="flex:1;padding:10px;border:1px solid var(--border);border-radius:10px"><button class="btn btn-secondary" data-comment="${post.id}">Enviar</button></div>
        </div>
      </article>`;
  }

  function bindRecipeButtons() {
    document.querySelectorAll('[data-recipe]').forEach(function (button) {
      button.addEventListener('click', function () {
        const recipe = state.recipes.find(function (item) { return item.id === button.dataset.recipe; });
        openModal(`
          <div class="modal-head"><div><span class="chip">${escapeHtml(recipe.time)}</span><h2 style="margin:8px 0 5px">${escapeHtml(recipe.title)}</h2><p class="muted">Por ${escapeHtml(recipe.author)}</p></div><button class="icon-btn" data-close>✕</button></div>
          <div class="recipe-cover" style="border-radius:18px;margin:18px 0">${recipe.emoji}</div>
          <h3>Ingredientes</h3><ul>${recipe.ingredients.map(function (item) { return `<li>${escapeHtml(item)}</li>`; }).join('')}</ul>
          <h3>Modo de preparo</h3><p class="muted" style="line-height:1.6">${escapeHtml(recipe.method)}</p>`);
      });
    });
  }

  function bindPostButtons() {
    document.querySelectorAll('[data-like]').forEach(function (button) {
      button.addEventListener('click', function () {
        const post = state.posts.find(function (item) { return item.id === button.dataset.like; });
        post.likedBy = post.likedBy || [];
        if (post.likedBy.includes(state.session.id)) {
          post.likedBy = post.likedBy.filter(function (id) { return id !== state.session.id; });
          post.likes = Math.max(0, post.likes - 1);
        } else {
          post.likedBy.push(state.session.id);
          post.likes += 1;
        }
        saveState();
        render();
      });
    });

    document.querySelectorAll('[data-comment]').forEach(function (button) {
      button.addEventListener('click', function () {
        const input = document.querySelector('[data-comment-input="' + button.dataset.comment + '"]');
        const text = input.value.trim();
        if (!text) return;
        const post = state.posts.find(function (item) { return item.id === button.dataset.comment; });
        const account = currentAccount();
        post.comments = post.comments || [];
        post.comments.push({ author: account.name, text: text });
        saveState();
        render();
      });
    });

    document.querySelectorAll('[data-share]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).catch(function () {});
        toast('Link copiado para compartilhar.');
      });
    });
  }

  function showHome() {
    const user = currentAccount();
    const myPosts = state.posts.filter(function (post) { return post.author === user.id; });
    const likedCount = state.posts.filter(function (post) { return (post.likedBy || []).includes(user.id); }).length;
    const consultation = state.consultations.find(function (item) { return item.user === user.id; });

    const content = `
      <div class="page-grid">
        <div style="display:grid;gap:18px">
          <section class="card hero">
            <h1>Olá, ${escapeHtml(user.name.split(' ')[0])}! 👋</h1>
            <p>Seu progresso não precisa ser perfeito. No APTUS, cada escolha consistente conta.</p>
            <div class="stats">
              <div class="stat"><span>Publicações</span><b>${myPosts.length}</b></div>
              <div class="stat"><span>Interações</span><b>${likedCount}</b></div>
              <div class="stat"><span>Próxima consulta</span><b>${consultation ? new Date(consultation.date + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'}</b></div>
            </div>
          </section>
          <section class="card"><div class="profile-row"><div class="avatar avatar-lg">${initials(user.name)}</div><div style="flex:1"><span class="chip">Perfil do usuário</span><h3>${escapeHtml(user.name)}</h3><p class="muted" style="margin:0 0 4px">${escapeHtml(user.bio)}</p><small class="muted">${escapeHtml(user.city || 'Brasil')}</small></div><button class="btn btn-secondary" id="editProfile">Editar</button></div></section>
          <section class="card"><div class="section-head"><h3>Seu objetivo da semana</h3><small>Meta demonstrativa</small></div><div class="goal"><div class="goal-line"><span>4 de 5 dias com rotina planejada</span><b>80%</b></div><div class="progress"><span style="width:80%"></span></div><p class="muted" style="margin:0;font-size:13px">Uma meta simples para acompanhar consistência sem transformar alimentação em cobrança.</p></div></section>
          <section class="card"><div class="section-head"><h3>Seus últimos conteúdos</h3><button class="btn btn-secondary" id="goSocial">Ver feed</button></div>${myPosts.length ? myPosts.map(function (post) { return postCard(post, true); }).join('') : '<div class="empty">Você ainda não publicou. Vá para Descobrir e crie sua primeira postagem.</div>'}</section>
        </div>
        <aside style="display:grid;gap:18px">
          <section class="card"><div class="section-head"><h3>Nutricionista</h3><small>Seu acompanhamento</small></div>${consultation ? '<div class="nutri"><div class="nutri-main"><div class="avatar">MC</div><div><h4>Dra. Marina Costa</h4><p>' + consultation.date + ' às ' + consultation.time + '</p></div></div><button class="btn btn-secondary" id="chatNow">Abrir</button></div>' : '<div class="empty">Escolha um nutricionista para iniciar seu acompanhamento.</div>'}</section>
          <section class="card"><div class="section-head"><h3>Receitas rápidas</h3><small>' + state.recipes.length + ' opções</small></div><div class="recipe-grid">' + state.recipes.slice(0, 2).map(recipeCard).join('') + '</div></section>
        </aside>
      </div>`;

    appShell('home', 'Início', content);
    document.getElementById('goSocial').addEventListener('click', function () { navigate('social'); });
    document.getElementById('editProfile').addEventListener('click', showEditProfile);
    const chatButton = document.getElementById('chatNow');
    if (chatButton) chatButton.addEventListener('click', function () { navigate('messages'); });
    bindRecipeButtons();
    bindPostButtons();
  }

  function showSocial() {
    let filter = 'Tudo';

    function renderFeed() {
      const posts = state.posts.filter(function (post) {
        if (filter === 'Tudo') return true;
        if (filter === 'Nutrição') return post.author.charAt(0) === 'n';
        if (filter === 'Receitas') return /marmita|bowl|omelete/i.test(post.title);
        if (filter === 'Hábitos') return /beber|rotina|hábito/i.test(post.title + ' ' + post.caption);
        return true;
      });
      return posts.length ? posts.map(function (post) { return postCard(post, false); }).join('') : '<div class="empty">Nenhum conteúdo nesta categoria.</div>';
    }

    function draw() {
      const content = `
        <div class="feed">
          <section class="card">
            <div class="section-head"><div><h3>Seu espaço de descoberta</h3><small>Receitas, curiosidades e histórias reais.</small></div><button class="btn btn-primary" id="newPost">+ Publicar</button></div>
            <div class="feed-controls">${['Tudo', 'Receitas', 'Nutrição', 'Hábitos'].map(function (item) { return `<button class="filter-pill ${filter === item ? 'active' : ''}" data-filter="${item}">${item}</button>`; }).join('')}</div>
          </section>
          <div id="feedList">${renderFeed()}</div>
          <section class="card"><div class="section-head"><h3>Receitas</h3><small>Toque para ver detalhes</small></div><div class="recipe-grid">${state.recipes.map(recipeCard).join('')}</div></section>
        </div>`;

      appShell('social', 'Descobrir', content);
      document.querySelectorAll('[data-filter]').forEach(function (button) {
        button.addEventListener('click', function () { filter = button.dataset.filter; draw(); });
      });
      document.getElementById('newPost').addEventListener('click', showNewPost);
      bindPostButtons();
      bindRecipeButtons();
    }

    draw();
  }

  function showNutrition() {
    const user = currentAccount();
    const content = `
      <div class="page-grid">
        <div style="display:grid;gap:18px">
          <section class="card hero"><h1>Encontre apoio profissional.</h1><p>Conecte-se com nutricionistas para conversar, organizar sua rotina e marcar acompanhamento.</p></section>
          <section class="card"><div class="section-head"><h3>Profissionais disponíveis</h3><small>2 nutricionistas na demo</small></div><div class="nutri-list">${state.nutritionists.map(function (nutri) { return `<div class="nutri"><div class="nutri-main"><div class="avatar">${initials(nutri.name)}</div><div><h4>${escapeHtml(nutri.name)}</h4><p>${escapeHtml(nutri.specialty)} • ${escapeHtml(nutri.crn)}</p></div></div><button class="btn btn-primary" data-contact="${nutri.id}">Conversar</button></div>`; }).join('')}</div></section>
        </div>
        <aside style="display:grid;gap:18px">
          <section class="card"><div class="section-head"><h3>Consultas</h3><small>Demo</small></div><table class="table"><thead><tr><th>Profissional</th><th>Data</th><th>Status</th></tr></thead><tbody>${state.consultations.filter(function (item) { return item.user === user.id; }).map(function (item) { return `<tr><td>Dra. Marina</td><td>${item.date}<br>${item.time}</td><td>${item.status}</td></tr>`; }).join('') || '<tr><td colspan="3" class="muted">Nenhuma consulta.</td></tr>'}</tbody></table></section>
          <section class="card"><h3 style="margin-top:0">Como o APTUS funciona?</h3><p class="muted" style="line-height:1.6">A plataforma incentiva informação, comunidade e acompanhamento profissional. Ela não substitui avaliação clínica individual.</p></section>
        </aside>
      </div>`;

    appShell('nutrition', 'Nutricionista', content);
    document.querySelectorAll('[data-contact]').forEach(function (button) {
      button.addEventListener('click', function () {
        const id = button.dataset.contact;
        if (!state.messages[id]) state.messages[id] = [{ from: id, text: 'Olá! Como posso te ajudar hoje?' }];
        saveState();
        navigate('messages');
      });
    });
  }

  function showMessages() {
    const isNutri = state.session.role === 'nutritionist';
    const partners = isNutri ? state.users : state.nutritionists;
    let activeId = isNutri ? (state.users[0] && state.users[0].id) : 'n1';

    function draw() {
      const activePartner = partners.find(function (person) { return person.id === activeId; }) || partners[0];
      activeId = activePartner ? activePartner.id : activeId;
      const conversation = state.messages[activeId] || [];
      const content = `
        <div class="page-grid">
          <section class="card chat">
            <div class="section-head"><h3>${escapeHtml(activePartner ? activePartner.name : 'Conversa')}</h3><small>Online agora</small></div>
            <div class="messages" id="messageList">${conversation.length ? conversation.map(function (message) { return `<div class="bubble ${message.from === state.session.id ? 'me' : 'them'}">${escapeHtml(message.text)}</div>`; }).join('') : '<div class="empty">Comece a conversa.</div>'}</div>
            <form class="chat-form" id="chatForm"><input id="chatInput" placeholder="Digite uma mensagem…" autocomplete="off"><button class="btn btn-primary">Enviar</button></form>
          </section>
          <aside style="display:grid;gap:18px"><section class="card"><div class="section-head"><h3>Contatos</h3><small>Selecione</small></div><div class="nutri-list">${partners.map(function (person) { return `<button class="nutri" data-person="${person.id}" style="text-align:left;background:#fff"><div class="nutri-main"><div class="avatar">${initials(person.name)}</div><div><h4>${escapeHtml(person.name)}</h4><p>${person.specialty ? escapeHtml(person.specialty) : 'Membro APTUS'}</p></div></div><span class="muted">›</span></button>`; }).join('')}</div></section></aside>
        </div>`;

      appShell('messages', 'Mensagens', content);
      document.querySelectorAll('[data-person]').forEach(function (button) {
        button.addEventListener('click', function () { activeId = button.dataset.person; draw(); });
      });
      document.getElementById('chatForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text) return;
        if (!state.messages[activeId]) state.messages[activeId] = [];
        state.messages[activeId].push({ from: state.session.id, text: text });
        saveState();
        draw();
        setTimeout(function () {
          if (!state.messages[activeId]) return;
          state.messages[activeId].push({ from: activeId, text: 'Recebi sua mensagem. Vamos acompanhar isso juntos. 💚' });
          saveState();
          draw();
        }, 500);
      });
    }

    draw();
  }

  function showNutritionistDashboard() {
    const nutri = currentAccount();
    const patients = state.users;
    const posts = state.posts.filter(function (post) { return post.author === nutri.id; });

    const content = `
      <div class="page-grid">
        <div style="display:grid;gap:18px">
          <section class="card hero"><span class="chip" style="background:rgba(255,255,255,.16);color:#fff">Perfil profissional</span><h1>Olá, ${escapeHtml(nutri.name)}.</h1><p>${escapeHtml(nutri.specialty)} • ${escapeHtml(nutri.crn)}</p><div class="stats"><div class="stat"><span>Pacientes</span><b>${patients.length}</b></div><div class="stat"><span>Mensagens</span><b>${Object.values(state.messages).reduce(function (sum, list) { return sum + list.length; }, 0)}</b></div><div class="stat"><span>Conteúdos</span><b>${posts.length}</b></div></div></section>
          <section class="card"><div class="section-head"><h3>Pacientes</h3><small>Acompanhamento</small></div><table class="table"><thead><tr><th>Nome</th><th>Cidade</th><th>Ação</th></tr></thead><tbody>${patients.map(function (patient) { return `<tr><td>${escapeHtml(patient.name)}</td><td>${escapeHtml(patient.city || 'Brasil')}</td><td><button class="btn btn-secondary" data-patient="${patient.id}">Mensagem</button></td></tr>`; }).join('')}</tbody></table></section>
        </div>
        <aside style="display:grid;gap:18px">
          <section class="card"><div class="section-head"><h3>Próximas consultas</h3><small>Demo</small></div><table class="table"><thead><tr><th>Cliente</th><th>Data</th></tr></thead><tbody>${state.consultations.map(function (item) { const patient = state.users.find(function (user) { return user.id === item.user; }); return `<tr><td>${escapeHtml(patient ? patient.name : 'Cliente')}</td><td>${item.date}<br>${item.time}</td></tr>`; }).join('')}</tbody></table></section>
          <section class="card"><h3 style="margin-top:0">Publicar conteúdo</h3><p class="muted">Adicione dicas e curiosidades para aparecer no feed.</p><button class="btn btn-primary" id="nutriPost">+ Criar conteúdo</button></section>
        </aside>
      </div>`;

    appShell('nutritionist', 'Painel profissional', content);
    document.querySelectorAll('[data-patient]').forEach(function (button) {
      button.addEventListener('click', function () {
        const id = button.dataset.patient;
        if (!state.messages[id]) state.messages[id] = [];
        saveState();
        navigate('messages');
      });
    });
    document.getElementById('nutriPost').addEventListener('click', showNewPost);
  }

  function showEditProfile() {
    const user = currentAccount();
    openModal(`
      <div class="modal-head"><div><h2 style="margin:0">Editar perfil</h2><p class="muted">Ajuste as informações do seu perfil.</p></div><button class="icon-btn" data-close>✕</button></div>
      <form id="profileForm">
        <div class="field"><label>Nome</label><input id="profileName" value="${escapeHtml(user.name)}"></div>
        <div class="field"><label>Bio</label><textarea id="profileBio" rows="4">${escapeHtml(user.bio)}</textarea></div>
        <div class="field"><label>Cidade</label><input id="profileCity" value="${escapeHtml(user.city || '')}"></div>
        <button class="btn btn-primary">Salvar</button>
      </form>`);

    document.getElementById('profileForm').addEventListener('submit', function (event) {
      event.preventDefault();
      user.name = document.getElementById('profileName').value.trim() || user.name;
      user.bio = document.getElementById('profileBio').value.trim();
      user.city = document.getElementById('profileCity').value.trim();
      saveState();
      closeModal();
      render();
      toast('Perfil atualizado.');
    });
  }

  function showNewPost() {
    openModal(`
      <div class="modal-head"><div><h2 style="margin:0">Nova publicação</h2><p class="muted">Compartilhe uma receita, curiosidade ou hábito.</p></div><button class="icon-btn" data-close>✕</button></div>
      <form id="postForm">
        <div class="field"><label>Título</label><input id="postTitle" required placeholder="Ex.: Meu café da manhã favorito"></div>
        <div class="field"><label>Legenda</label><textarea id="postCaption" rows="4" required placeholder="Conte o que você gostaria de compartilhar…"></textarea></div>
        <div class="field"><label>Categoria</label><select id="postCategory"><option>Receitas</option><option>Nutrição</option><option>Hábitos</option></select></div>
        <button class="btn btn-primary">Publicar</button>
      </form>`);

    document.getElementById('postForm').addEventListener('submit', function (event) {
      event.preventDefault();
      state.posts.unshift({
        id: 'p' + Date.now(),
        author: state.session.id,
        type: 'reel',
        title: document.getElementById('postTitle').value.trim(),
        caption: document.getElementById('postCaption').value.trim(),
        category: document.getElementById('postCategory').value,
        likes: 0,
        likedBy: [],
        comments: [],
        tone: 'green'
      });
      saveState();
      closeModal();
      navigate('social');
      toast('Publicação criada!');
    });
  }

  function openModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-card">' + content + '</div>';
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-close]').forEach(function (button) { button.addEventListener('click', function () { modal.remove(); }); });
    modal.addEventListener('click', function (event) { if (event.target === modal) modal.remove(); });
  }

  function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  }

  function render() {
    if (!state.session) {
      showAuth();
      return;
    }

    const page = (window.location.hash || '#home').slice(1) || 'home';
    if (state.session.role === 'nutritionist') {
      if (page === 'social') showSocial();
      else if (page === 'messages') showMessages();
      else showNutritionistDashboard();
    } else {
      if (page === 'social') showSocial();
      else if (page === 'nutrition') showNutrition();
      else if (page === 'messages') showMessages();
      else showHome();
    }
  }

  render();
})();
