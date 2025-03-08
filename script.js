const { jsPDF } = window.jspdf || {};

// Debug navigasi
document.querySelectorAll('a[href="checkin.html"]').forEach(link => {
    link.addEventListener('click', function(e) {
        console.log('Link Check-in diklik, href:', this.href);
    });
});

// Banner Slide
let currentBanner = 0;
const banners = document.querySelectorAll('.banner-img');

banners.forEach(banner => {
    banner.style.left = '-100%';
});

function showNextBanner() {
    const current = banners[currentBanner];
    current.classList.add('exit');

    currentBanner = (currentBanner + 1) % banners.length;
    const next = banners[currentBanner];
    next.classList.add('active');

    setTimeout(() => {
        current.classList.remove('exit', 'active');
        current.style.left = '-100%';
    }, 800);
}

banners[currentBanner].classList.add('active');
setInterval(showNextBanner, 2000);

// Search Ticket (Bagian yang Diubah)
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const departure = document.getElementById('departure').value;
            const destination = document.getElementById('destination').value;
            const date = document.getElementById('date').value;

            if (!departure || !destination || !date) {
                document.getElementById('ticket-list').innerHTML = '<p>Harap isi semua kolom!</p>';
                return;
            }

            if (departure === destination) {
                document.getElementById('ticket-list').innerHTML = '<p>Kota keberangkatan dan tujuan tidak boleh sama!</p>';
                return;
            }

            // Data jarak antar kota (km, perkiraan)
            const distances = {
                'CGK-KNO': 1400, 'CGK-PDG': 925, 'CGK-SUB': 690, 'CGK-DPS': 980, 'CGK-BPN': 1250,
                'CGK-UPG': 1400, 'CGK-JOG': 430, 'CGK-PKU': 780, 'CGK-PLM': 470, 'CGK-BTH': 850,
                'CGK-BDJ': 940, 'CGK-PNK': 820, 'CGK-SRG': 420, 'CGK-SOC': 450, 'CGK-AMQ': 2400,
                'CGK-DJJ': 3800, 'CGK-TIM': 3000, 'CGK-BIK': 3400, 'CGK-MDC': 2100
            };

            // Harga dasar per rute dari CGK (dalam Rupiah)
            const basePrices = {
                'CGK-KNO': 900000, 'CGK-PDG': 700000, 'CGK-SUB': 600000, 'CGK-DPS': 850000, 'CGK-BPN': 1100000,
                'CGK-UPG': 1200000, 'CGK-JOG': 450000, 'CGK-PKU': 650000, 'CGK-PLM': 500000, 'CGK-BTH': 750000,
                'CGK-BDJ': 800000, 'CGK-PNK': 700000, 'CGK-SRG': 400000, 'CGK-SOC': 420000, 'CGK-AMQ': 2000000,
                'CGK-DJJ': 3500000, 'CGK-TIM': 2800000, 'CGK-BIK': 3000000, 'CGK-MDC': 1800000
            };

            // Maskapai dengan faktor harga
            const airlines = [
                { name: "Garuda Indonesia", priceFactor: 1.2 },
                { name: "Lion Air", priceFactor: 0.8 },
                { name: "Citilink", priceFactor: 0.9 },
                { name: "Batik Air", priceFactor: 1.1 },
                { name: "Super Air Jet", priceFactor: 0.85 },
                { name: "AirAsia", priceFactor: 0.95 }
            ];

            const routeKey = `${departure}-${destination}`;
            const reverseRouteKey = `${destination}-${departure}`;
            let basePrice = basePrices[routeKey] || basePrices[reverseRouteKey];

            if (!basePrice) {
                const distance = distances[routeKey] || distances[reverseRouteKey] || 1000;
                basePrice = distance * 500;
            }

            const randomFactor = 0.95 + Math.random() * 0.1;
            basePrice = Math.round(basePrice * randomFactor);

            const tickets = airlines.map(airline => {
                const price = Math.round(basePrice * airline.priceFactor);
                const time = generateRandomTime();
                return { airline: airline.name, time, price };
            }).sort((a, b) => a.price - b.price);

            const ticketList = document.getElementById('ticket-list');
            ticketList.innerHTML = `
                <h2>Penerbangan ${departure} - ${destination}</h2>
                <p>Tanggal: ${new Date(date).toLocaleDateString('id-ID')}</p>
            `;
            tickets.forEach(ticket => {
                const div = document.createElement('div');
                div.classList.add('ticket');
                div.innerHTML = `
                    <p><strong>${ticket.airline}</strong></p>
                    <p>Jam: ${ticket.time}</p>
                    <p>Harga: Rp ${ticket.price.toLocaleString()}</p>
                    <button onclick="selectTicket('${ticket.airline}', ${ticket.price}, '${departure}', '${destination}', '${date}', '${ticket.time}')">Pilih Tiket</button>
                `;
                ticketList.appendChild(div);
            });
        });
    }
});

function generateRandomTime() {
    const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function selectTicket(airline, price, departure, destination, date, time) {
    const ticketData = { airline, price, departure, destination, date, time };
    localStorage.setItem('selectedTicket', JSON.stringify(ticketData));
    window.location.href = 'passenger.html';
}

// Passenger Form Validation
document.getElementById('passenger-form')?.addEventListener('input', function() {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const bookBtn = document.getElementById('book-btn');
    bookBtn.disabled = !(name && age && phone && email);
});

document.getElementById('passenger-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const passengerData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        promo: document.getElementById('promo')?.value || '',
        ...JSON.parse(localStorage.getItem('selectedTicket')),
        bookingCode: generateBookingCode()
    };
    localStorage.setItem('passengerData', JSON.stringify(passengerData));
    console.log('Passenger Data Saved:', passengerData);
    window.location.href = 'payment.html';
});

// Payment Form
document.getElementById('payment-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const status = document.getElementById('payment-status').value;
    const passengerData = JSON.parse(localStorage.getItem('passengerData'));
    if (status === 'paid') {
        if (passengerData && passengerData.name && passengerData.airline && passengerData.price) {
            generateReceipt(passengerData);
        } else {
            alert('Data pemesanan tidak lengkap atau tidak ditemukan. Silakan pesan tiket terlebih dahulu.');
        }
    } else {
        alert('Silakan lakukan pembayaran terlebih dahulu.');
    }
});

// Check-in Form
document.getElementById('checkin-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('checkin-name').value;
    const bookingCode = document.getElementById('booking-code').value;
    const passengerData = JSON.parse(localStorage.getItem('passengerData'));

    console.log('Check-in Input:', { name, bookingCode });
    console.log('Stored Data:', passengerData);

    if (passengerData && passengerData.name === name && passengerData.bookingCode === bookingCode) {
        const seat = Math.floor(Math.random() * 30) + 1 + String.fromCharCode(65 + Math.floor(Math.random() * 6));
        document.getElementById('checkin-result').innerHTML = `
            <p>Nama: ${passengerData.name}</p>
            <p>Umur: ${passengerData.age}</p>
            <p>Nomor HP: ${passengerData.phone}</p>
            <p>Email: ${passengerData.email}</p>
            <p>Maskapai: ${passengerData.airline}</p>
            <p>Harga: Rp ${passengerData.price.toLocaleString()}</p>
            <p>Kursi: ${seat}</p>
            <button onclick="generateBoardingPass('${passengerData.name}', '${passengerData.airline}', '${seat}', '${passengerData.bookingCode}')">Download Boarding Pass</button>
        `;
    } else {
        document.getElementById('checkin-result').innerHTML = '<p>Kode booking atau nama tidak cocok. Pastikan data sesuai!</p>';
    }
});

// Generate Random Booking Code
function generateBookingCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Generate Receipt PDF
function generateReceipt(data) {
    try {
        if (!jsPDF) throw new Error('jsPDF library not loaded.');
        const doc = new jsPDF({ orientation: 'landscape' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageCenter = pageWidth / 2;
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        const labelWidth = 50;
        const startY = 30;
        const lineHeight = 15;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('FlyGo - Biodata Penumpang', pageCenter, startY, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        doc.setLineWidth(0.5);
        doc.rect(margin, startY + 10, contentWidth, 120);

        doc.setFontSize(12);
        const textY = startY + 30;

        doc.text('Nama', margin + 10, textY);
        doc.text(`: ${data.name}`, margin + labelWidth, textY);

        doc.text('Umur', margin + 10, textY + lineHeight);
        doc.text(`: ${data.age}`, margin + labelWidth, textY + lineHeight);

        doc.text('Nomor HP', margin + 10, textY + lineHeight * 2);
        doc.text(`: ${data.phone}`, margin + labelWidth, textY + lineHeight * 2);

        doc.text('Email', margin + 10, textY + lineHeight * 3);
        doc.text(`: ${data.email}`, margin + labelWidth, textY + lineHeight * 3);

        doc.text('Kode Booking', margin + 10, textY + lineHeight * 4);
        doc.text(`: ${data.bookingCode}`, margin + labelWidth, textY + lineHeight * 4);

        doc.text('Maskapai', margin + 10, textY + lineHeight * 5);
        doc.text(`: ${data.airline}`, margin + labelWidth, textY + lineHeight * 5);

        doc.text('Harga', margin + 10, textY + lineHeight * 6);
        doc.text(`: Rp ${data.price.toLocaleString()}`, margin + labelWidth, textY + lineHeight * 6);

        doc.setFontSize(10);
        const footerY = pageHeight - 20;
        doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, pageCenter, footerY, { align: 'center' });
        doc.text('Harap simpan file ini atau mencatat kode booking | Terima kasih telah memilih FlyGo!', pageCenter, footerY + 10, { align: 'center' });

        doc.setLineWidth(0.3);
        doc.line(margin, startY + 15, margin + contentWidth, startY + 15);

        doc.save('Biodata.pdf');
    } catch (error) {
        console.error('Error generating receipt:', error);
        alert('Terjadi kesalahan saat membuat kuitansi: ' + error.message);
    }
}

// Generate Boarding Pass PDF
function generateBoardingPass(name, airline, seat, bookingCode) {
    try {
        if (!jsPDF) throw new Error('jsPDF library not loaded.');
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 167] });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageCenter = pageWidth / 2;
        const margin = 20;
        const labelWidth = 50;
        const startY = 20;
        const lineHeight = 10;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('FlyGo - Boarding Pass', pageCenter, startY, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        doc.setFontSize(12);
        const textY = startY + 20;
        const passengerData = JSON.parse(localStorage.getItem('passengerData'));

        doc.text('Nama', margin + 10, textY);
        doc.text(`: ${passengerData.name}`, margin + labelWidth, textY);

        doc.text('Umur', margin + 10, textY + lineHeight);
        doc.text(`: ${passengerData.age}`, margin + labelWidth, textY + lineHeight);

        doc.text('Nomor HP', margin + 10, textY + lineHeight * 2);
        doc.text(`: ${passengerData.phone}`, margin + labelWidth, textY + lineHeight * 2);

        doc.text('Email', margin + 10, textY + lineHeight * 3);
        doc.text(`: ${passengerData.email}`, margin + labelWidth, textY + lineHeight * 3);

        doc.text('Keberangkatan', margin + 10, textY + lineHeight * 4);
        doc.text(`: ${passengerData.departure}`, margin + labelWidth, textY + lineHeight * 4);

        doc.text('Tujuan', margin + 10, textY + lineHeight * 5);
        doc.text(`: ${passengerData.destination}`, margin + labelWidth, textY + lineHeight * 5);

        doc.text('Tanggal', margin + 10, textY + lineHeight * 6);
        doc.text(`: ${new Date(passengerData.date).toLocaleDateString('id-ID')}`, margin + labelWidth, textY + lineHeight * 6);

        doc.text('Waktu', margin + 10, textY + lineHeight * 7);
        doc.text(`: ${passengerData.time}`, margin + labelWidth, textY + lineHeight * 7);

        doc.text('Maskapai', margin + 10, textY + lineHeight * 8);
        doc.text(`: ${passengerData.airline}`, margin + labelWidth, textY + lineHeight * 8);

        doc.text('Kode Booking', margin + 10, textY + lineHeight * 9);
        doc.text(`: ${passengerData.bookingCode}`, margin + labelWidth, textY + lineHeight * 9);

        doc.text('Kursi', margin + 10, textY + lineHeight * 10);
        doc.text(`: ${seat}`, margin + labelWidth, textY + lineHeight * 10);

        doc.setFontSize(10);
        const footerY = pageHeight - 15;
        doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, pageCenter, footerY, { align: 'center' });
        doc.text('Harap simpan file ini atau mencatat kode booking | Terima kasih telah memilih FlyGo!', pageCenter, footerY + 5, { align: 'center' });

        doc.setLineWidth(0.3);
        doc.line(margin, startY + 15, pageWidth - margin, startY + 15);

        doc.save('boarding-pass.pdf');
    } catch (error) {
        console.error('Error generating boarding pass:', error);
        alert('Terjadi kesalahan saat membuat boarding pass: ' + error.message);
    }
}