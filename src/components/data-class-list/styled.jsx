import { InputBase } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TreeView } from '../tree-view/TreeView';

export const StyledTreeView = styled(TreeView)(({ theme }) => ({
    overflowY: 'auto',
    height: '100%',
    /* width */
    '::-webkit-scrollbar': {
        width: 6,
    },

    /* Track */
    '::-webkit-scrollbar-track': {
        // boxShadow: 'inset 0 0 5px #fff',
        // borderRadius: 10
    },

    /* Handle */
    '::-webkit-scrollbar-thumb': {
        background: '#d8d8d8',
        borderRadius: 10
    },

    /* Handle on hover */
    '::-webkit-scrollbar-thumb:hover': {
        background: '#bbc',
    }
}))

export const StyledSearchForm = styled('form')(({ theme }) => ({
    display: 'flex',
    padding: 0,
    margin: 5,
}))

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
    flexGrow: 1,
    border: '1px solid',
    borderColor: theme.palette.secondary.main,
    borderRight: 'none',
    padding: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
}))


export const StyledSearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 1),
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.secondary.main,
    color: '#fff',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
}))