import { ChevronRight, ExpandMore } from "@mui/icons-material"
import { Box, Collapse, Stack } from "@mui/material"
import { createContext, useState, useContext, useEffect } from "react"

function useTreeViewContext() {
    let [data, setData] = useState({})
    return {
        data,
        setMetaNode: (nodeId, value) => setData({ ...data, [nodeId]: value }),
        getMetaNode: (nodeId) => data[nodeId]
    }
}

export const TreeViewContext = createContext({ data: {}, setMetaNode: () => { }, getMetaNode: () => { } })

export const TreeView = ({ children, ...props }) => {
    const context = useTreeViewContext()
    return (
        <TreeViewContext.Provider value={context}>
            <Box {...props}>
                {children}
            </Box>
        </TreeViewContext.Provider>
    )
}

export const TreeItem = ({ nodeId, node, children, render, ...props }) => {
    const context = useContext(TreeViewContext)
    const open = context.getMetaNode(nodeId)?.open

    useEffect(() => {
        if (open === undefined) {
            context.setMetaNode(nodeId, { open: true })
        }
    }, [])

    function toggleColapse() {
        const open = context.getMetaNode(nodeId)?.open || false
        context.setMetaNode(nodeId, { open: !open })
    }
    let PreIcon = children && open
        ? <ExpandMore fontSize='small'/>
        : children
            ? <ChevronRight fontSize='small'/>
            : null

    return (
        <Box {...props}>
            <Stack direction='row' alignItems='center' onClick={toggleColapse} sx={{cursor: 'pointer'}}>
                {PreIcon}
                {render(node)}
            </Stack>
            <Collapse sx={{ paddingLeft: 2 }} in={context.getMetaNode(nodeId)?.open}>
                {children}
            </Collapse>
        </Box>
    )
}