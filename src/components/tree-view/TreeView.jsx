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

export const TreeItem = ({ nodeId, node, render, renderChildren, ...props }) => {
    const context = useContext(TreeViewContext)
    const open = context.getMetaNode(nodeId)?.open
    const [collapseIn, setCollapseIn] = useState(false)

    useEffect(() => {
        if (open === undefined) {
            context.setMetaNode(nodeId, { open: true })
        }
    }, [])

    useEffect(() => {
        const id = setTimeout(setCollapseIn(open), 500)
        return () => clearTimeout(id)
    }, [open])

    function toggleColapse() {
        let id = null
        if(open){
            setCollapseIn(false)
            id = setTimeout(() =>  context.setMetaNode(nodeId, { open: !open }), 300)
        }else {
            context.setMetaNode(nodeId, { open: !open })
           id = setTimeout(() =>  setCollapseIn(true), 500)
        }  
    }
    let PreIcon = Array.isArray(node.children) && open
        ? <ExpandMore fontSize='small'/>
        : Array.isArray(node.children)
            ? <ChevronRight fontSize='small'/>
            : null

    return (
        <Box {...props}>
            <Stack position='relative' direction='row' alignItems='center' onClick={toggleColapse} 
            sx={{cursor: 'pointer', paddingLeft: 1}}>
                <Box position='absolute' left={-12}>
                    {PreIcon}
                </Box>
                {render(node)}
            </Stack>
            <Collapse sx={{ paddingLeft: 2 }} in={collapseIn}>
                {open && renderChildren(open)}
            </Collapse>
        </Box>
    )
}