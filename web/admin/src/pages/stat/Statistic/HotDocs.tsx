import { getApiV1StatHotPages } from '@/request/Stat';
import Nodata from '@/assets/images/nodata.png';
import Card from '@/components/Card';
import { useAppSelector } from '@/store';
import { Box, Stack } from '@mui/material';
import { Ellipsis } from '@ctzhian/ui';
import { useEffect, useState } from 'react';
import { ActiveTab, TimeList } from '.';
import { DomainHotPage } from '@/request/types';

const HotDocs = ({ tab }: { tab: ActiveTab }) => {
  const { kb_id = '' } = useAppSelector(state => state.config);
  const [list, setList] = useState<DomainHotPage[]>([]);
  const [max, setMax] = useState(0);

  useEffect(() => {
    if (!kb_id) return;
    getApiV1StatHotPages({ kb_id, day: tab }).then(res => {
      const data = res.sort((a, b) => b.count! - a.count!).slice(0, 7);
      setList(data);
      setMax(Math.max(...data.map(item => item.count!)));
    });
  }, [tab, kb_id]);

  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        sx={{ mb: 2 }}
      >
        <Box sx={{ fontSize: 16, fontWeight: 'bold' }}>热门文档</Box>
        <Box sx={{ fontSize: 12, color: 'text.tertiary' }}>
          {TimeList.find(it => it.value === tab)?.label}
        </Box>
      </Stack>
      {list.length > 0 ? (
        <Stack gap={2}>
          {list.map((it, index) => (
            <Box key={index} sx={{ fontSize: 12 }}>
              <Stack
                direction={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
                gap={2}
              >
                <Ellipsis sx={{ flex: 1, width: 0 }}>
                  {it.node_name || '-'}
                </Ellipsis>
                <Box sx={{ fontWeight: 700 }}>{it.count}</Box>
              </Stack>
              <Box
                sx={{
                  height: 6,
                  mt: '6px',
                  borderRadius: '3px',
                  bgcolor: 'background.paper3',
                }}
              >
                <Box
                  sx={{
                    height: 6,
                    background:
                      'linear-gradient( 90deg, #3248F2 0%, #9E68FC 100%)',
                    width: `${(it.count! / max) * 100}%`,
                    borderRadius: '3px',
                  }}
                ></Box>
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack
          alignItems={'center'}
          justifyContent={'center'}
          sx={{ fontSize: 12, color: 'text.disabled' }}
        >
          <img src={Nodata} width={100} />
          暂无数据
        </Stack>
      )}
    </Card>
  );
};

export default HotDocs;
