document.addEventListener('DOMContentLoaded', () => {
    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            document.cookie.split(';').forEach(cookie => {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                }
            });
        }
        return cookieValue;
    };

    const csrftoken = getCookie('csrftoken');
    const estrelasContainer = document.querySelector('.estrelas');
    const estrelas = estrelasContainer.querySelectorAll('span');
    const mediaSpan = document.querySelector('.media');

    let notaSelecionada = 0; // guarda a nota que o usuário selecionou

    const atualizarEstrelas = (media) => {
        estrelas.forEach(s => {
            s.style.color = s.dataset.valor <= media ? 'gold' : 'gray';
        });
    };

    // Inicializa cores das estrelas
    atualizarEstrelas(parseFloat(estrelasContainer.dataset.media));

    // Hover e clique apenas seleciona a nota
    estrelas.forEach(e => {
        e.addEventListener('mouseover', () => {
            atualizarEstrelas(parseInt(e.dataset.valor));
        });

        e.addEventListener('mouseout', () => {
            atualizarEstrelas(notaSelecionada || parseFloat(estrelasContainer.dataset.media));
        });

        e.addEventListener('click', () => {
            notaSelecionada = parseInt(e.dataset.valor); // salva a nota clicada
            atualizarEstrelas(notaSelecionada); // mantém visualmente
        });
    });

    // Botão Avaliar envia a nota
    const avaliarBtn = document.getElementById('avaliar-btn');
    avaliarBtn?.addEventListener('click', () => {
        if (notaSelecionada === 0) {
            alert("Selecione uma nota antes de avaliar!");
            return;
        }

        fetch(`/avaliar/${romId}/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            body: new URLSearchParams({ estrelas: notaSelecionada })
        })
            .then(res => res.json())
            .then(data => {
                // Atualiza média (opcional)
                estrelasContainer.dataset.media = data.media;
                mediaSpan.textContent = parseFloat(data.media).toFixed(2);
                atualizarEstrelas(parseFloat(data.media));

                alert('Sua avaliação foi registrada!');
            })
            .catch(err => console.error('Erro ao avaliar ROM:', err));
    });

});