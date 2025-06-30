
// Инициализация IndexedDB
window.db = (function() {
    const DB_NAME = "CompetitionDB";
    const DB_VERSION = 2;
    const STORE_NAME = "applicants";

    let db;

    // Открытие базы данных
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Ошибка при открытии базы данных:", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                    store.createIndex("fullName", "fullName", { unique: false });
                    store.createIndex("status", "status", { unique: false });
                }
            };
        });
    }

    // Получить всех абитуриентов
    async function getApplicants() {
        await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    }

    // Получить абитуриента по ID
    async function getApplicant(id) {
        await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    }

    // Добавить абитуриента
    async function addApplicant(data) {
        await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(data);

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    }

    // Обновить абитуриента
    async function updateApplicant(id, data) {
        await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ ...data, id });

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    }

    // Удалить абитуриента
    async function deleteApplicant(id) {
        await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    }

    // Инициализация начальными данными (если база пуста)
    async function initSampleData() {
        const applicants = await getApplicants();
        if (applicants.length === 0) {
            await addApplicant(
                new Applicant(
                    null,
                    "Иванов Иван Иванович",
                    "2000-05-15",
                    245,
                    "МГУ, ВШЭ, МФТИ",
                    "pending"
                )
            );
            await addApplicant(
                new Applicant(
                    null,
                    "Петрова Анна Сергеевна",
                    "1999-11-22",
                    278,
                    "МГУ, СПбГУ",
                    "accepted"
                )
            );
            await addApplicant(
                new Applicant(
                    null,
                    "Сидоров Алексей Петрович",
                    "2001-02-10",
                    192,
                    "МФТИ, МИФИ",
                    "waiting"
                )
            );
        }
    }

    // Вызов инициализации
    initSampleData();

    return {
        getApplicants,
        getApplicant,
        addApplicant,
        updateApplicant,
        deleteApplicant,
    };
})();