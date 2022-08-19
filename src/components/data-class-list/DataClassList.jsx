import { useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Box, InputBase, Autocomplete, TextField } from '@mui/material'
import { TreeItem, TreeView } from '@mui/lab'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { ExpandMore, ChevronRight, Folder, SearchOutlined, } from '@mui/icons-material'
import { StyledInputBase, StyledSearchIconWrapper, StyledTreeItem, StyledTreeView, StyledSearchForm } from './styled'

const initState = {
    treeView: [
        {
            id: uuid(),
            name: 'Hạ tầng giao thông',
            children: [
                { id: uuid(), name: 'Ranh đất', icon: 'turned_in_not' },
                { id: uuid(), name: 'Quy hoạch 1778', icon: 'turned_in_not' },
                { id: uuid(), name: 'Tìm đường' },
                { id: uuid(), name: 'Ranh đất', icon: 'turned_in_not' },
                { id: uuid(), name: 'Quy hoạch', icon: 'turned_in_not' },
                { id: uuid(), name: 'Lô đất 1', icon: 'turned_in_not' },
                { id: uuid(), name: 'Lô đất 2', icon: 'turned_in_not' },
                { id: uuid(), name: 'Bó vỉa', icon: 'turned_in_not' },
                { id: uuid(), name: 'Hiện Trạng Công Viên Phần Mềm', icon: 'turned_in_not' },
            ]
        },
        {
            id: uuid(),
            name: 'Công viên cây xanh',
            children: [
                { id: uuid(), name: 'Công viên 1' },
                {
                    id: uuid(),
                    name: 'Công viên 2',
                    children: [
                        { id: uuid(), name: 'Quy hoạch', icon: 'turned_in_not' },
                        { id: uuid(), name: 'Lô đất 1', icon: 'turned_in_not' },
                        { id: uuid(), name: 'Lô đất 2', icon: 'turned_in_not' },
                        { id: uuid(), name: 'Bó vỉa', icon: 'turned_in_not' },
                    ]
                },
                { id: uuid(), name: 'Công viên 3' },
            ]
        },
        {
            id: uuid(), name: 'Công viên 1', children: [],
        },
        {
            id: uuid(), name: 'Công viên x',
        },
    ]
}

// const options = initState.treeView.fi

export const DataClassList = () => {
    const [treeView, setTreeView] = useState(initState.treeView)
    const [selectedClasses, setSelectedClasses] = useState(new Set())
    const [searchTreeView, setSearchTreeView] = useState({ search: '', items: initState.treeView })

    const selectables = useMemo(() => {
        const result = []
        const stack = [...treeView]
        while (stack.length > 0) {
            const current = stack.pop()
            if (Array.isArray(current.children)) {
                stack.push(...current.children)
            } else {
                result.push({ id: current.id, name: current.name })
            }
        }
        return result.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

    }, [treeView])

    useEffect(() => {
        const result = selectables.filter(item => item.name.toLowerCase().search(searchTreeView.search.toLowerCase()) >= 0)
        setSearchTreeView((current) => ({ ...current, items: result }))
    }, [searchTreeView.search, selectables])

    const renderTree = (nodes) => (
        <StyledTreeItem key={nodes.id} nodeId={nodes.id}
            folder={Array.isArray(nodes.children)}
            selectable={!Array.isArray(nodes.children)}
            labelText={!Array.isArray(nodes.children) ? nodes.name : `${nodes.name} (${nodes.children.length})`}
            labelIcon={nodes?.icon}
            id={nodes.id}
            selected={selectedClasses.has(nodes.id)}
            onChange={(e, value) => {
                const classes = new Set(selectedClasses)
                if (value) {
                    if (value.checked) {
                        classes.add(value.id)
                    } else {
                        classes.delete(value.id)
                    }
                    console.log(classes);
                    setSelectedClasses(classes)
                }
            }}
        >
            {Array.isArray(nodes.children)
                ? nodes.children.map((node) => renderTree(node))
                : null}
        </StyledTreeItem>
    );
    return (
        <>
            <StyledSearchForm>
                <StyledInputBase placeholder="Nhập tên lớp dữ liệu" value={searchTreeView.search}
                    onChange={(e) => { setSearchTreeView((current) => ({ ...current, search: e.target.value })) }}
                />
                <StyledSearchIconWrapper>
                    <SearchOutlined />
                </StyledSearchIconWrapper>
            </StyledSearchForm>
            <StyledTreeView
                aria-label="rich object"
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                sx={{ paddingX: 1, flexGrow: 1, flexBasis: 0, flexShrink: 1, maxWidth: 500, overflowY: 'auto' }}
            >
                {(searchTreeView.search.length > 0
                    ? searchTreeView.items
                    : treeView)
                    .map(root => renderTree(root))}
            </StyledTreeView>
        </>
    )
}