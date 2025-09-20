import { getApiV1AppDetail } from '@/request';
import { getApiV1KnowledgeBaseList } from '@/request/KnowledgeBase';
import { putApiV1NodeDetail } from '@/request/Node';
import { V1NodeDetailResp } from '@/request/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { setKbDetail, setKbId, setKbList } from '@/store/slices/config';
import { message } from '@ctzhian/ui';
import { Box, Drawer, Stack, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Catalog from './Catalog';

export interface WrapContext {
  catalogOpen: boolean;
  setCatalogOpen: (open: boolean) => void;
  nodeDetail: V1NodeDetailResp | null;
  setNodeDetail: (detail: V1NodeDetailResp) => void;
  onSave: (content: string) => void;
  docWidth: string;
}

const DocEditor = () => {
  const catalogWidth = 292;
  const isWideScreen = useMediaQuery('(min-width:1400px)');
  const dispatch = useAppDispatch();
  const { kb_id = '' } = useAppSelector(state => state.config);
  const [nodeDetail, setNodeDetail] = useState<V1NodeDetailResp>({});
  const [catalogOpen, setCatalogOpen] = useState(true);

  const [docWidth, setDocWidth] = useState<string>('full');

  const getInfo = async () => {
    const res = await getApiV1AppDetail({ kb_id: kb_id!, type: '1' });
    setDocWidth(res.settings?.theme_and_style?.doc_width || 'full');
  };

  const getKbList = (id?: string) => {
    const kb_id = id || localStorage.getItem('kb_id') || '';
    getApiV1KnowledgeBaseList().then(res => {
      if (res.length > 0) {
        dispatch(setKbList(res));
        const kbDetail = res.find(item => item.id === kb_id);
        if (kbDetail) {
          dispatch(setKbId(kb_id));
          dispatch(setKbDetail(kbDetail));
        } else {
          dispatch(setKbId(res[0]?.id || ''));
        }
      }
    });
  };

  const onSave = async (content: string) => {
    if (!kb_id || !nodeDetail.id) return;
    try {
      await putApiV1NodeDetail({
        kb_id,
        id: nodeDetail.id,
        content,
        name: nodeDetail.name || '',
      });
      message.success('保存成功');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setCatalogOpen(isWideScreen);
  }, [isWideScreen]);

  useEffect(() => {
    if (!kb_id) {
      getKbList();
    } else {
      getInfo();
    }
  }, [kb_id]);

  return (
    <Stack
      direction='row'
      sx={{ color: 'text.primary', bgcolor: 'background.default' }}
    >
      <Drawer
        variant='persistent'
        anchor='left'
        open={catalogOpen}
        sx={{
          width: catalogOpen ? catalogWidth : 0,
          flexShrink: 0,
          transition: 'width 0.3s ease-in-out',
          '.MuiPaper-root': {
            width: catalogWidth,
            boxShadow: 'none !important',
            boxSizing: 'border-box',
          },
        }}
      >
        <Catalog curNode={nodeDetail} setCatalogOpen={setCatalogOpen} />
      </Drawer>
      <Box sx={{ flexGrow: 1 }}>
        <Outlet
          context={{
            catalogOpen,
            setCatalogOpen,
            nodeDetail,
            setNodeDetail,
            onSave,
            docWidth,
          }}
        />
      </Box>
    </Stack>
  );
};

export default DocEditor;
