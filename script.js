document.addEventListener('DOMContentLoaded', loadCategories);
document.addEventListener('input', updateSummary);

function loadCategories() {
    fetch('categorias.json')
        .then(response => response.json())
        .then(data => {
            const categorySelect = document.getElementById('category');
            const categorySections = document.getElementById('category-sections');

            data.categorias.forEach((categoria, index) => {

                const option = document.createElement('option');
                option.value = `categoria-${index}`;
                option.textContent = categoria.nombre;
                categorySelect.appendChild(option);

                const sectionDiv = document.createElement('div');
                sectionDiv.id = `categoria-${index}`;
                sectionDiv.classList.add('category-section');
                sectionDiv.style.display = 'none';

                const h2 = document.createElement('h2');
                h2.textContent = categoria.nombre;
                sectionDiv.appendChild(h2);

                categoria.items.forEach(item => {
                    const inputGroup = document.createElement('div');
                    inputGroup.classList.add('input-group');

                    const label = document.createElement('label');
                    label.setAttribute('for', item.id);
                    label.textContent = item.nombre;
                    inputGroup.appendChild(label);

                    const customNumberInput = document.createElement('div');
                    customNumberInput.classList.add('custom-number-input');

                    const decrementButton = document.createElement('button');
                    decrementButton.type = 'button';
                    decrementButton.textContent = '-';
                    decrementButton.onclick = () => decrement(item.id);
                    customNumberInput.appendChild(decrementButton);

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = item.id;
                    input.min = 0;
                    input.value = 0;
                    input.classList.add('quantity-input');
                    customNumberInput.appendChild(input);

                    const incrementButton = document.createElement('button');
                    incrementButton.type = 'button';
                    incrementButton.textContent = '+';
                    incrementButton.onclick = () => increment(item.id);
                    customNumberInput.appendChild(incrementButton);

                    inputGroup.appendChild(customNumberInput);
                    sectionDiv.appendChild(inputGroup);
                });

                categorySections.appendChild(sectionDiv);
            });
        });
}

function incrementc(id) {
    const input = document.getElementById(id);
    input.value = parseInt(input.value) + 1;
}

function decrementc(id) {
    const input = document.getElementById(id);
    if (input.value > 0) {
        input.value = parseInt(input.value) - 1;
    }
}


function increment(id) {
    const input = document.getElementById(id);
    input.value = parseInt(input.value) + 1;
    updateSummary();
}

function decrement(id) {
    const input = document.getElementById(id);
    if (input.value > 0) {
        input.value = parseInt(input.value) - 1;
    }
    updateSummary();
}

function showCategory() {
    const selectedCategory = document.getElementById('category').value;
    const sections = document.querySelectorAll('.category-section');

    sections.forEach(section => {
        section.style.display = 'none';
    });

    if (selectedCategory) {
        document.getElementById(selectedCategory).style.display = 'block';
    }
}

function updateSummary() {
    const items = document.querySelectorAll('input[type="number"]');
    const summaryList = document.getElementById('summary-list');
    summaryList.innerHTML = '';

    items.forEach(item => {
        const quantity = item.value;
        if (quantity > 0) {
            const label = item.closest('.input-group').querySelector('label');
            const listItem = document.createElement('li');
            listItem.textContent = `${label.textContent}: ${quantity}`;
            summaryList.appendChild(listItem);
        }
    });
}

function openConfirmationModal() {
    updateConfirmationSummary();
    document.getElementById('confirmationModal').style.display = 'block';
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

function updateConfirmationSummary() {
    const items = document.querySelectorAll('#summary-list li');
    const confirmationSummary = document.getElementById('confirmation-summary');
    confirmationSummary.innerHTML = '';

    items.forEach(item => {
        const listItem = document.createElement('p');
        listItem.textContent = item.textContent;
        confirmationSummary.appendChild(listItem);
    });

    if (items.length === 0) {
        confirmationSummary.textContent = 'No se seleccionó ningún ítem.';
    }
}

function confirmAndSend() {
    const items = document.querySelectorAll('#summary-list li');
    let message = 'Resumen de Pedido en Lavanderías Jardín:\n\n';
    
    items.forEach(item => {
        message += item.textContent + '\n';
    });

    if (items.length === 0) {
        message += 'No se seleccionó ningún ítem.';
    }

    const piso = document.getElementById('piso').value;
    const departamento = document.getElementById('departamento').value;

    if (piso > 0) {
        message += `\nPiso: ${piso}`;
    }
    if (departamento > 0) {
        message += `\nDepartamento: ${departamento}`;
    }

    const phoneNumber = '59170783199';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank');
    closeConfirmationModal();
}




function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('Lavanderia - Detalle', 10, 10);

    const items = document.querySelectorAll('#summary-list li');
    let y = 20;

    items.forEach(item => {
        doc.text(item.textContent, 10, y);
        y += 10;
    });

    doc.save('lavanderia_detalle.pdf');
}

function openModal() {
    document.getElementById('infoModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}
