import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { ExpandMore, ChevronRight, SearchOutlined, } from '@mui/icons-material'
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

export const DataClassList = () => {
    const [treeView, setTreeView] = useState(initState.treeView)
    const [selectedClasses, setSelectedClasses] = useState(new Set())
    const [searchTreeView, setSearchTreeView] = useState({ search: '', items: initState.treeView })

    useEffect(() => {
        if (searchTreeView.search.length === 0) return
        const stack = [...treeView]
        const visitedTracker = new Map()
        const searchResult = []
        const mapIdToObject = new Map()

        // search by name
        while (stack.length > 0) {
            const current = { ...stack.pop() }
            mapIdToObject.set(current.id, { id: current.id, name: current.name })
            if (current.name.toLowerCase().search(searchTreeView.search.toLowerCase()) >= 0) {
                searchResult.push(current)
            } else if (Array.isArray(current.children)) {
                stack.push(...current.children)
                for (let index = 0; index < current.children.length; index++) {
                    visitedTracker.set(current.children[index].id, current.id)
                };
            }
        }

        // build search result tree
        const searchResultTree = []
        for (let index = 0; index < searchResult.length; index++) {
            let parent = mapIdToObject.get(visitedTracker.get(searchResult[index].id)) || null
            let child = searchResult[index]
            let currentTree = child
            while (parent != null) {
                const p = child
                if (parent.children && parent.children.every(item => item.id !== p.id)) {
                    parent.children.push(child)
                } else {
                    parent.children = [child]
                }
                child = parent
                currentTree = parent
                parent = mapIdToObject.get(visitedTracker.get(parent.id)) || null
            }
            if (currentTree) {
                if (searchResultTree.every(item => item.id !== currentTree.id)) {
                    searchResultTree.push(currentTree)
                }
            }
        }
        setSearchTreeView((current) => ({ search: current.search, items: searchResultTree }))
    }, [searchTreeView.search, treeView])

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