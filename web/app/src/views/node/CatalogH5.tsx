'use client';

import { IconArrowDown, IconNav } from '@/components/icons';
import { filterTreeBySearch } from '@/utils';
import { addExpandState } from '@/utils/drag';
import { useParams } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Stack, TextField } from '@mui/material';
import { useDebounce } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';
import CatalogFolder from './CatalogFolder';
import { useStore } from '@/provider';

const CatalogH5 = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const params = useParams() || {};
  const id = params.id as string;
  const { tree: initialTree, kbDetail } = useStore();
  const debouncedSearchTerm = useDebounce(searchTerm, { wait: 300 });

  const catalogSetting = kbDetail?.settings?.catalog_settings;
  const catalogFolderExpand = catalogSetting?.catalog_folder !== 2;

  const tree = useMemo(() => {
    const { tree: originalTree } = addExpandState(
      initialTree || [],
      id as string,
      catalogFolderExpand,
    );
    return filterTreeBySearch(originalTree, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (id) {
      setOpen(false);
    }
  }, [id]);

  return (
    <Box
      sx={{
        position: 'sticky',
        top: '64px',
        width: '100%',
        zIndex: 2,
        bgcolor: 'background.paper3',
      }}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{
          py: 3,
          px: 3,
          position: 'relative',
          zIndex: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
        onClick={() => setOpen(!open)}
      >
        <Stack direction='row' alignItems='center' gap={1}>
          <IconNav sx={{ fontSize: 18 }} />
          <Box
            sx={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'text.primary',
            }}
          >
            目录
          </Box>
        </Stack>
        <IconArrowDown
          sx={{
            fontSize: 24,
            transform: open ? 'rotate(-180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease-in-out',
            cursor: 'pointer',
          }}
        />
      </Stack>
      <Box
        sx={{
          '--fallback-height': 'calc(100vh - 131px)',
          '--dynamic-height': 'calc(100dvh - 131px)',
          px: 3,
          height: open
            ? 'var(--dynamic-height, var(--fallback-height))'
            : '0px',
          paddingBottom: 'env(safe-area-inset-bottom)',
          transition: 'height 0.3s ease-in-out',
          bgcolor: 'background.paper3',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <TextField
          slotProps={{
            input: {
              endAdornment: <SearchIcon sx={{ fontSize: 20 }} />,
            },
          }}
          size='small'
          placeholder='搜索'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{
            width: '100%',
            mt: 2,
            mb: 1,
            '& .MuiOutlinedInput-root': {
              height: 36,
              fontSize: 14,
              pr: '18px',
              '& fieldset': {
                borderRadius: '10px',
                borderColor: 'divider',
                px: 2,
              },
            },
          }}
        />
        <Box sx={{ py: 3 }}>
          {tree.map(item => (
            <CatalogFolder
              key={item.id}
              item={item}
              searchTerm={debouncedSearchTerm}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CatalogH5;
