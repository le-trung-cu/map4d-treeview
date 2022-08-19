import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import { Checkbox, FormControlLabel, Icon, InputBase } from '@mui/material'
import { Folder } from '@mui/icons-material'
import { Stack } from '@mui/system';
import { TreeView } from '@mui/lab';

export const StyledTreeView = styled(TreeView)(({ theme }) => ({
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

const StyledTreeItemRoot = styled(TreeItem)(({ theme, ...props }) =>{
    return ({
    color: theme.palette.text.secondary,
    [`& .${treeItemClasses.content}`]: {
        height: '100%',
        color: theme.palette.text.secondary,
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        '&.Mui-expanded': {
            fontWeight: theme.typography.fontWeightRegular,
        },
        '&:hover': {
            backgroundColor: 'transparent',
            // backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
            backgroundColor: 'transparent',
            // backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
            color: 'var(--tree-view-color)',
        },
        [`& .${treeItemClasses.label}`]: {
            fontWeight: 'inherit',
            color: 'inherit',
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 0,
        paddingLeft: theme.spacing(2),
        [`& .${treeItemClasses.content}`]: {
            // paddingLeft: theme.spacing(2),
        },
    },
})});

export function StyledTreeItem(props) {
    const {
        selectable,
        selected = false,
        folder,
        bgColor,
        color,
        labelIcon,
        labelInfo,
        labelText,
        ...other
    } = props;

    return (
        <StyledTreeItemRoot
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0, height: folder? 46 : 34}}>
                    {folder && [
                        <Folder key={1} color='secondary' fontSize='small' sx={{ mr: 1 }} />,
                        <Typography key={2} variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                            {labelText}
                        </Typography>
                    ]}
                    {selectable
                        && <FormControlLabel sx={{ flexGrow: 1, margin: 0 }}
                            control={<Checkbox
                                checked={selected}
                                size='small'
                                sx={{ padding: 0 }}
                                onChange={(e, checked) => other?.onChange(e, { id: other?.id, checked })} />}
                            label={
                                <Stack direction='row' alignItems='center' margin={0} >
                                    {labelIcon && <Icon sx={{ mr: '1px' }} fontSize='small'>{labelIcon}</Icon>}
                                    <Typography variant="caption">
                                        {labelText}
                                    </Typography>
                                </Stack>
                            } />}
                </Box>
            }
            style={{
                '--tree-view-color': color,
                '--tree-view-bg-color': bgColor,
                boxShadow: folder ? '0 1px' : 'none'
                // borderBottom: folder? '1px solid black' : 'none'
            }}
            {...other}
        />
    );
}

StyledTreeItem.propTypes = {
    folder: PropTypes.bool,
    selectable: PropTypes.bool,
    bgColor: PropTypes.string,
    color: PropTypes.string,
    labelIcon: PropTypes.string,
    labelInfo: PropTypes.string,
    labelText: PropTypes.string.isRequired,
};

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