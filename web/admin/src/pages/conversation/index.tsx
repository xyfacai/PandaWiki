import { DomainConversationListItem } from '@/request/types';
import { getApiV1Conversation } from '@/request/Conversation';
import Logo from '@/assets/images/logo.png';
import NoData from '@/assets/images/nodata.png';
import Card from '@/components/Card';
import { AppType } from '@/constant/enums';
import { tableSx } from '@/constant/styles';
import { useURLSearchParams } from '@/hooks';
import { useAppSelector } from '@/store';
import { Box, Stack } from '@mui/material';
import { Ellipsis, Icon, Table } from 'ct-mui';
import { ColumnType } from 'ct-mui/dist/Table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Detail from './Detail';
import Search from './Search';

const Conversation = () => {
  const { kb_id = '' } = useAppSelector(state => state.config);
  const [searchParams, setSearchParams] = useURLSearchParams();
  const conversion_id = searchParams.get('conversion_id') || '';
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('page_size') || '20');
  const subject = searchParams.get('subject') || '';
  const remoteIp = searchParams.get('remote_ip') || '';
  const [data, setData] = useState<DomainConversationListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);

  const columns: ColumnType<DomainConversationListItem>[] = [
    {
      dataIndex: 'subject',
      title: '问题',
      render: (text: string, record) => {
        const isGroupChat = record.info?.user_info?.from === 1;
        return (
          <>
            <Stack direction={'row'} alignItems={'center'} gap={1}>
              <Icon
                sx={{ fontSize: 12 }}
                type={
                  AppType[record.app_type as keyof typeof AppType]?.icon || ''
                }
              />
              <Ellipsis
                className='primary-color'
                sx={{ cursor: 'pointer', flex: 1, width: 0 }}
                onClick={() => {
                  // setId(record.id)
                  setSearchParams({ conversion_id: record.id! });
                  setOpen(true);
                }}
              >
                {text}
              </Ellipsis>
            </Stack>
            <Box sx={{ color: 'text.auxiliary', fontSize: 12 }}>
              {AppType[record.app_type as keyof typeof AppType]?.label || '-'}
            </Box>
          </>
        );
      },
    },
    {
      dataIndex: 'info',
      title: '来源用户',
      width: 220,
      render: (text: DomainConversationListItem['info']) => {
        const user = text?.user_info;
        return (
          <Box sx={{ fontSize: 12 }}>
            <Stack
              direction={'row'}
              alignItems={'center'}
              gap={0.5}
              sx={{ cursor: 'pointer' }}
            >
              <img src={user?.avatar || Logo} width={16} />
              <Box sx={{ fontSize: 14 }}>
                {user?.real_name || user?.name || '匿名用户'}
              </Box>
            </Stack>
            {user?.email && (
              <Box sx={{ color: 'text.auxiliary' }}>{user?.email}</Box>
            )}
          </Box>
        );
      },
    },
    {
      dataIndex: 'remote_ip',
      title: '来源 IP',
      width: 200,
      render: (text: string, record) => {
        const { city = '', country = '', province = '' } = record.ip_address!;
        return (
          <>
            <Box>{text}</Box>
            <Box sx={{ color: 'text.auxiliary', fontSize: 12 }}>
              {country === '中国' ? `${province}-${city}` : `${country}`}
            </Box>
          </>
        );
      },
    },
    {
      dataIndex: 'created_at',
      title: '问答时间',
      width: 160,
      render: (text: string) => {
        return (
          <Stack>
            <Box>{dayjs(text).fromNow()}</Box>
            <Box sx={{ fontSize: 12, color: 'text.auxiliary' }}>
              {dayjs(text).format('YYYY-MM-DD HH:mm:ss')}
            </Box>
          </Stack>
        );
      },
    },
  ];

  const getData = () => {
    setLoading(true);
    getApiV1Conversation({
      page,
      per_page: pageSize,
      kb_id,
      subject,
      remote_ip: remoteIp,
    })
      .then(res => {
        setData(res.data || []);
        setTotal(res.total || 0);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (conversion_id) setOpen(true);
  }, [conversion_id]);

  useEffect(() => {
    if (kb_id) getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, subject, remoteIp, kb_id]);

  return (
    <Card>
      <Stack
        direction='row'
        alignItems={'center'}
        justifyContent={'space-between'}
        sx={{ p: 2 }}
      >
        <Search />
      </Stack>
      <Table
        columns={columns}
        dataSource={data}
        rowKey='id'
        height='calc(100vh - 148px)'
        size='small'
        sx={{
          overflow: 'hidden',
          ...tableSx,
          '.MuiTableContainer-root': {
            height: 'calc(100vh - 148px - 70px)',
          },
        }}
        pagination={{
          total,
          page,
          pageSize,
          onChange: (page, pageSize) => {
            setSearchParams({ page: String(page), pageSize: String(pageSize) });
          },
        }}
        PaginationProps={{
          sx: {
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
            '.MuiSelect-root': {
              width: 100,
            },
          },
        }}
        renderEmpty={
          loading ? (
            <Box></Box>
          ) : (
            <Stack alignItems={'center'} sx={{ mt: 20 }}>
              <img src={NoData} width={174} />
              <Box>暂无数据</Box>
            </Stack>
          )
        }
      />
      <Detail
        id={conversion_id}
        open={open}
        onClose={() => {
          setOpen(false);
          setSearchParams({ conversion_id: '' });
        }}
      />
    </Card>
  );
};

export default Conversation;
