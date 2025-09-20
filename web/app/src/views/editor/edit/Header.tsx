'use client';
import { V1NodeDetailResp } from '@/request/types';
import { IconBaocun } from '@panda-wiki/icons';
import { Box, Button, IconButton, Skeleton, Stack } from '@mui/material';
import { Ellipsis, Icon, message } from '@ctzhian/ui';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWrapContext } from '..';

interface HeaderProps {
  edit: boolean;
  collaborativeUsers?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  isSyncing?: boolean;
  detail: V1NodeDetailResp;
  updateDetail: (detail: V1NodeDetailResp) => void;
  handleSave: () => void;
}

const Header = ({ edit, detail, handleSave }: HeaderProps) => {
  const firstLoad = useRef(true);

  const { catalogOpen, nodeDetail, setCatalogOpen, saveLoading } =
    useWrapContext();

  useEffect(() => {
    firstLoad.current = false;
  }, [nodeDetail?.updated_at]);

  return (
    <Box sx={{ p: 1 }}>
      <Stack
        direction={'row'}
        alignItems={'center'}
        gap={1}
        justifyContent={'space-between'}
        sx={{ height: '40px' }}
      >
        {!catalogOpen && (
          <Stack
            alignItems='center'
            justifyContent='space-between'
            onClick={() => setCatalogOpen(true)}
            sx={{
              cursor: 'pointer',
              color: 'text.auxiliary',
              ':hover': {
                color: 'text.primary',
              },
            }}
          >
            <Icon
              type='icon-muluzhankai'
              sx={{
                fontSize: 24,
              }}
            />
          </Stack>
        )}
        <Stack sx={{ width: 0, flex: 1 }}>
          {detail?.name ? (
            <Ellipsis sx={{ fontSize: 14, fontWeight: 'bold' }}>
              <Box
                component='span'
                sx={{ cursor: 'pointer' }}
                // onClick={() => setRenameOpen(true)}
              >
                {detail.name}
              </Box>
            </Ellipsis>
          ) : // <Skeleton variant='text' width={300} height={24} />
          null}
          {nodeDetail?.updated_at && (
            <Stack
              direction={'row'}
              alignItems={'center'}
              gap={0.5}
              sx={{ fontSize: 12, color: 'text.auxiliary' }}
            >
              <IconBaocun sx={{ fontSize: 12 }} />
              {nodeDetail?.updated_at ? (
                dayjs(nodeDetail.updated_at).format('YYYY-MM-DD HH:mm:ss')
              ) : (
                <Skeleton variant='text' width={100} height={24} />
              )}
            </Stack>
          )}
        </Stack>

        <Stack direction={'row'} gap={4}>
          <Button
            size='small'
            variant='contained'
            disabled={!detail.name || saveLoading}
            startIcon={<IconBaocun />}
            onClick={handleSave}
          >
            保存
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Header;
