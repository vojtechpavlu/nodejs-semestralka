const groups = []

export const getGroup = (groupname) => {
    return groups.find((group) => {return group.groupname === groupname});
}

export const addMessage = (message) => {

}