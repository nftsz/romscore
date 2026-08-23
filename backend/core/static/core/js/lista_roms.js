// lista_roms.js
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

    document.querySelectorAll('.rom').forEach(romDiv => {
        const estrelas = romDiv.querySelectorAll('.estrelas span');
        const mediaSpan = romDiv.querySelector('.media');
        const estrelasContainer = romDiv.querySelector('.estrelas');

        const atualizarEstrelas = (media) => {
            estrelas.forEach(s => {
                s.style.color = s.dataset.valor <= media ? 'gold' : 'gray';
            });
        };

        // Inicializa cores das estrelas
        atualizarEstrelas(parseFloat(estrelasContainer.dataset.media));

        estrelas.forEach(e => {
            e.addEventListener('mouseover', () => {
                atualizarEstrelas(parseInt(e.dataset.valor));
            });

            e.addEventListener('mouseout', () => {
                atualizarEstrelas(parseFloat(estrelasContainer.dataset.media));
            });

            e.addEventListener('click', () => {
                const valor = e.dataset.valor;
                const romId = romDiv.dataset.romId;

                fetch(`/avaliar/${romId}/`, {
                    method: 'POST',
                    headers: { 'X-CSRFToken': csrftoken },
                    body: new URLSearchParams({ estrelas: valor })
                })
                .then(res => res.json())
                .then(data => {
                    estrelasContainer.dataset.media = data.media;
                    mediaSpan.textContent = parseFloat(data.media).toFixed(2);
                    atualizarEstrelas(parseFloat(data.media));
                })
                .catch(err => console.error('Erro ao avaliar ROM:', err));
            });
        });

        //Clique no card inteiro para abrir detalhe
        romDiv.addEventListener('click', () => {
            const romId = romDiv.dataset.romId;
            window.location.href = `/rom/${romId}/`;
        });
    });
});