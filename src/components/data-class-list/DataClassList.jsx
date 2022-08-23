import { useEffect, useRef, useState } from 'react'
// import { v4 as uuid } from 'uuid'
import { SearchOutlined, Folder, } from '@mui/icons-material'
import { StyledInputBase, StyledSearchIconWrapper, StyledSearchForm, StyledTreeView } from './styled'
import { TreeItem } from '../tree-view/TreeView'
import { Checkbox, Divider, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { menuData } from '../../data/menu'

// const initState = {
//     treeView: [
//         {
//             id: uuid(),
//             name: 'Hạ tầng giao thông',
//             children: [
//                 { id: uuid(), name: 'Ranh đất', icon: 'turned_in_not' },
//                 { id: uuid(), name: 'Quy hoạch 1778', icon: 'turned_in_not' },
//                 { id: uuid(), name: 'Tìm đường' },
//                 { id: uuid(), name: 'Ranh đất', icon: 'turned_in_not' },
//                 { id: uuid(), name: 'Quy hoạch', icon: 'turned_in_not' },
//                 { id: uuid(), name: 'Lô đất 1', icon: 'turned_in_not' },
//                 { id: uuid(), name: 'Lô đất 2', icon: 'turned_in_not' },
//                 { id: uuid(), name: 'Bó vỉa', icon: 'turned_in_not' },
//                 { id: uuid(), name: 'Hiện Trạng Công Viên Phần Mềm', icon: 'turned_in_not' },
//             ]
//         },
//         {
//             id: uuid(),
//             name: 'Công viên cây xanh',
//             children: [
//                 { id: uuid(), name: 'Công viên 1' },
//                 {
//                     id: uuid(),
//                     name: 'Công viên 2',
//                     children: [
//                         { id: uuid(), name: 'Quy hoạch', icon: 'turned_in_not' },
//                         { id: uuid(), name: 'Lô đất 1', icon: 'turned_in_not' },
//                         { id: uuid(), name: 'Lô đất 2', icon: 'turned_in_not' },
//                         { id: uuid(), name: 'Bó vỉa', icon: 'turned_in_not' },
//                     ]
//                 },
//                 { id: uuid(), name: 'Công viên 3' },
//             ]
//         },
//         {
//             id: uuid(), name: 'Công viên 1', children: [],
//         },
//         {
//             id: uuid(), name: 'Công viên x',
//         },
//     ]
// }

function fetchMenuData() {
    return menuData.map(item => ({ ...item }))
}

function buildTreeViewState(menuData) {
    const treeView = []
    const otherIotlink = []
    const mapIdToObject = new Map()
    for (let index = 0; index < menuData.length; index++) {
        const menuDataItem = menuData[index]
        mapIdToObject.set(menuDataItem.id, menuDataItem)
    }
    for (let index = 0; index < menuData.length; index++) {
        const menuDataItem = menuData[index]
        if (menuDataItem.parentId !== null) {
            const parent = mapIdToObject.get(menuDataItem.parentId)
            if (parent === undefined) {
                otherIotlink.push(menuDataItem)
            }
            // console.log(parent, menuDataItem.parentId);
            else if (parent.children === undefined) {
                parent.children = [menuDataItem]
            } else {
                parent.children.push(menuDataItem)
            }
        } else {
            treeView.push(menuDataItem)
        }
    }

    // treeView[0].children.push(...otherIotlink)
    return treeView[0].children
}


function removeAccents(str = '') {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export const DataClassList = () => {
    const [treeView, setTreeView] = useState([])
    const selectedClasses = useRef(new Set())
    const [searchTreeView, setSearchTreeView] = useState({ search: '', items: [] })

    useEffect(() => {
        const menuData = fetchMenuData()
        const treeView = buildTreeViewState(menuData)
        setTreeView(treeView)
    }, [])

    useEffect(() => {
        if (searchTreeView.search.length === 0) return

        const timeoutId = setTimeout(() => {

            const searchNormalize = removeAccents(searchTreeView.search).toLowerCase()
            const stack = [...treeView]
            const visitedTracker = new Map()
            let searchResult = []
            const mapIdToObject = new Map()

            // search by name
            while (stack.length > 0) {
                const { children, ...current } = stack.pop()
                mapIdToObject.set(current.id, current)
                if (removeAccents(current.name.toLowerCase()).search(searchNormalize) >= 0) {
                    searchResult.push({ ...current, children })
                } else if (Array.isArray(children)) {
                    stack.push(...children)
                    for (let index = 0; index < children.length; index++) {
                        visitedTracker.set(children[index].id, current.id)
                    };
                }
            }

            console.log(searchResult);

            // build search result tree
            // reverse searchResult array is needed to maintain order for nodes
            searchResult = searchResult.reverse()
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
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchTreeView.search, treeView])

    const renderFolderTreeItem = (node) => (
        <Stack direction='row' alignItems='center' height={40}>
            <Folder fontSize='small' color='secondary' sx={{ mr: 1 }} />
            <Typography variant='caption'>{node.name}</Typography>
        </Stack>
    )

    const renderSelectableTreeItem = (node) => (
        <Stack direction='row' alignItems='center'>
            {<Checkbox
                size='small'
                sx={{ml: '-9px'}}
                checked={selectedClasses.current.has(node.id)}
                onChange={(_, checked) => {
                    if (checked)
                        selectedClasses.current.add(node.id)
                    else
                        selectedClasses.current.delete(node.id)
                    console.log(selectedClasses);
                }} />}
            {node.image2D && <img alt='' height={24} width={24} src={node.image2D} />}
            <Typography variant='caption'>{node.name}</Typography>
        </Stack>
    )

    const renderTree = (node) => {
        const render = node.type === 'folder'
            ? renderFolderTreeItem
            : renderSelectableTreeItem

        return <TreeItem
            key={node.id}
            nodeId={node.id}
            node={node}
            render={render}
            renderChildren={Array.isArray(node.children)
                ? () => node.children.map((item) => renderTree(item))
                : () => null}
        />
    }

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
                sx={{ paddingX: 1, flexGrow: 1, flexBasis: 0, flexShrink: 1, maxWidth: 500, overflowY: 'auto' }}
            >
                {(searchTreeView.search.length > 0
                    ? searchTreeView.items
                    : treeView)
                    .map(root => (
                        <div key={root.id}>
                            {renderTree(root)}
                            <Divider />
                        </div>))}
            </StyledTreeView>
        </>
    )
}