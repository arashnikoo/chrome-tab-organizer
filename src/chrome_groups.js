// Sort tab groups alphabetically by name
async function sortGroupsByName() {
    try {
        const allTabs = await chrome.tabs.query({});

        // Group tabs by window
        const tabsByWindow = {};
        for (const tab of allTabs) {
            if (!tabsByWindow[tab.windowId]) {
                tabsByWindow[tab.windowId] = [];
            }
            tabsByWindow[tab.windowId].push(tab);
        }

        // Sort tabs in each window
        for (const [windowId, tabs] of Object.entries(tabsByWindow)) {
            // Get all groups in this window
            const groups = await chrome.tabGroups.query({ windowId: parseInt(windowId) });

            // Create a map of group IDs to group names
            const groupNames = {};
            for (const group of groups) {
                groupNames[group.id] = group.title || '';
            }

            // Sort tabs: grouped tabs first (alphabetically), then ungrouped tabs at the end
            const sortedTabs = tabs.sort((a, b) => {
                const groupA = a.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE ? '' : groupNames[a.groupId] || '';
                const groupB = b.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE ? '' : groupNames[b.groupId] || '';

                // Ungrouped tabs go last
                if (groupA === '' && groupB !== '') return 1;
                if (groupA !== '' && groupB === '') return -1;

                // Compare group names alphabetically
                if (groupA !== groupB) {
                    return groupA.localeCompare(groupB);
                }

                // Same group, maintain original order
                return a.index - b.index;
            });

            // Move tabs to their sorted positions
            for (let i = 0; i < sortedTabs.length; i++) {
                await chrome.tabs.move(sortedTabs[i].id, { index: i });
            }
        }
    } catch (error) {
        console.warn("Error sorting groups:", error);
    }
}
