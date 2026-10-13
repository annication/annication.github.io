const STORAGE_KEY = "annication:progress:v1";

export function getCompletedTopics() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored === null) {
            return [];
        }

        const topicIds = JSON.parse(stored);

        return Array.isArray(topicIds)
            ? topicIds.filter(id => typeof id === "string")
            : [];
    } catch (error) {
        console.error("Fortschritt konnte nicht geladen werden.", error);
        return [];
    }
}

export function isTopicCompleted(topicId) {
    return getCompletedTopics().includes(topicId);
}

export function setTopicCompleted(topicId, completed) {
    const completedTopics = new Set(getCompletedTopics());

    if (completed) {
        completedTopics.add(topicId);
    } else {
        completedTopics.delete(topicId);
    }

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([...completedTopics])
        );
    } catch (error) {
        console.error("Fortschritt konnte nicht gespeichert werden.", error);
        return false;
    }

    window.dispatchEvent(
        new CustomEvent("annication:progress-changed", {
            detail: { topicId, completed }
        })
    );

    return true;
}

export function getCourseProgress(topicIds) {
    const completedTopics = new Set(getCompletedTopics());
    const uniqueTopicIds = [...new Set(topicIds)];

    const completed = uniqueTopicIds.filter(
        id => completedTopics.has(id)
    ).length;

    const total = uniqueTopicIds.length;

    return {
        completed,
        total,
        percentage: total === 0
            ? 0
            : Math.round((completed / total) * 100)
    };
}