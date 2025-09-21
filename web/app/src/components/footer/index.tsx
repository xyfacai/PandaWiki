'use client';

import logo from '@/assets/images/footer-logo.png';
import { KBDetail } from '@/assets/type';
import { useStore } from '@/provider';
import { Box, Divider, Stack } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IconPhone, IconWechat } from '../icons';
import Overlay from './Overlay';
import { DocWidth } from '@/constant';

const Footer = ({
  showBrand = true,
  kbDetail,
  mobile,
  isDocPage = false,
  catalogWidth,
  isWelcomePage = false,
}: {
  kbDetail?: KBDetail;
  mobile?: boolean;
  catalogShow?: boolean;
  catalogWidth?: number;
  showBrand?: boolean;
  isDocPage?: boolean;
  isWelcomePage?: boolean;
}) => {
  const [curOverlayType, setCurOverlayType] = useState('');
  const [open, setOpen] = useState(false);
  const [wechatData, setWechatData] = useState<{ src: string; text: string }>({
    src: '',
    text: '',
  });
  const [phoneData, setPhoneData] = useState<{ phone: string; text: string }>({
    phone: '',
    text: '',
  });
  const docWidth = useMemo(() => {
    if (isWelcomePage) return 'full';
    return kbDetail?.settings?.theme_and_style?.doc_width || 'full';
  }, [kbDetail, isWelcomePage]);
  const footerSetting = kbDetail?.settings?.footer_settings;
  const customStyle = kbDetail?.settings?.web_app_custom_style;
  if (mobile)
    return (
      <>
        <Box
          id='footer'
          sx={{
            position: 'relative',
            fontSize: '12px',
            fontWeight: 'normal',
            zIndex: 1,
            px: 3,
            bgcolor: 'background.footer',
            borderTop: '1px solid',
            borderColor: 'divider',
            width: '100%',
          }}
        >
          {showBrand && (
            <Box
              pt={
                customStyle?.footer_show_intro
                  ? 5
                  : (footerSetting?.brand_groups?.length || 0) > 0
                    ? 5
                    : 0
              }
            >
              {customStyle?.footer_show_intro !== false && (
                <Box sx={{ mb: 3 }}>
                  <Stack direction={'row'} alignItems={'center'} gap={1}>
                    {footerSetting?.brand_logo && (
                      <img
                        src={footerSetting.brand_logo}
                        alt='PandaWiki'
                        height={24}
                      />
                    )}
                    <Box
                      sx={{
                        fontWeight: 'bold',
                        lineHeight: '32px',
                        fontSize: 24,
                        color: 'white',
                      }}
                    >
                      {footerSetting?.brand_name}
                    </Box>
                  </Stack>
                  {footerSetting?.brand_desc && (
                    <Box
                      sx={{
                        fontSize: 12,
                        lineHeight: '26px',
                        mt: 2,
                        color: 'rgba(255, 255, 255, 0.70)',
                      }}
                    >
                      {footerSetting.brand_desc}
                    </Box>
                  )}
                  <Stack direction={'column'} gap={2.5} mt={2}>
                    {customStyle?.social_media_accounts?.map(
                      (account, index) => {
                        return (
                          <Stack
                            direction={'row'}
                            key={index}
                            sx={{
                              position: 'relative',
                              color: 'rgba(255, 255, 255, 0.70)',
                            }}
                            gap={1}
                            onClick={() => {
                              setCurOverlayType(account.channel || '');
                              if (account.channel === 'phone') {
                                setPhoneData({
                                  phone: account.phone || '',
                                  text: account.text || '',
                                });
                                setOpen(true);
                              }
                              if (account.channel === 'wechat_oa') {
                                setWechatData({
                                  src: account.icon || '',
                                  text: account.text || '',
                                });
                                setOpen(true);
                              }
                            }}
                          >
                            {account.channel === 'wechat_oa' && (
                              <IconWechat
                                sx={{ fontSize: '20px', color: 'inherit' }}
                              ></IconWechat>
                            )}
                            {account.channel === 'phone' && (
                              <IconPhone
                                sx={{ fontSize: '20px', color: 'inherit' }}
                              ></IconPhone>
                            )}
                            <Box
                              sx={{
                                lineHeight: '24px',
                                fontSize: '12px',
                                color: 'inherit',
                              }}
                            >
                              {account.text}
                            </Box>
                            {account.channel === 'wechat_oa' &&
                              (account?.text || account?.icon) && (
                                <Stack
                                  direction={'column'}
                                  alignItems={'center'}
                                  bgcolor={'#fff'}
                                  p={1.5}
                                  sx={{
                                    position: 'absolute',
                                    top: '40px',
                                    left: 0,
                                    boxShadow:
                                      ' 0px 4px 8px 0px rgba(255,255,255,0.25)',
                                    borderRadius: '4px',
                                  }}
                                  gap={1}
                                  display={'none'}
                                  zIndex={999}
                                >
                                  {account.icon && (
                                    <img
                                      src={account.icon}
                                      width={83}
                                      height={83}
                                    ></img>
                                  )}
                                  {account.text && (
                                    <Box
                                      sx={{
                                        fontSize: '12px',
                                        lineHeight: '16px',
                                        color: '#21222D',
                                        maxWidth: '83px',

                                        textAlign: 'center',
                                      }}
                                    >
                                      {account.text}
                                    </Box>
                                  )}
                                </Stack>
                              )}
                          </Stack>
                        );
                      },
                    )}
                  </Stack>
                </Box>
              )}

              <Stack direction={'row'} flexWrap={'wrap'} gap={2}>
                {footerSetting?.brand_groups?.map((group, idx) => (
                  <Stack
                    gap={1}
                    key={group.name}
                    sx={{
                      fontSize: 14,
                      lineHeight: '22px',
                      width: 'calc(50% - 8px)',
                      ...(idx > 1 && {
                        mt: 1,
                      }),
                      '& a:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: 14,
                        lineHeight: '24px',
                        mb: 1,
                        color: '#ffffff',
                      }}
                    >
                      {group.name}
                    </Box>
                    {group.links?.map(link => (
                      <Box color={'rgba(255,255,255,0.5)'} key={link.name}>
                        <Link
                          href={link?.url || ''}
                          target='_blank'
                          key={link.name}
                          prefetch={false}
                        >
                          {link.name}
                        </Link>
                      </Box>
                    ))}
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
          {!(
            customStyle?.footer_show_intro === false &&
            footerSetting?.brand_groups?.length === 0
          ) && (
            <Stack
              sx={{
                height: '1px',
                width: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.10)',
                mt: 5,
                mb: 3,
              }}
            ></Stack>
          )}

          {!!footerSetting?.corp_name && (
            <Box
              sx={{
                height: 40,
                lineHeight: '40px',
                color: 'rgba(255, 255, 255, 0.30)',
              }}
            >
              {footerSetting?.corp_name}
            </Box>
          )}
          {!!footerSetting?.icp && (
            <Box
              sx={{
                height: 40,
                lineHeight: '40px',
                color: 'rgba(255, 255, 255, 0.30)',
              }}
            >
              {footerSetting?.icp}
            </Box>
          )}
          {customStyle?.show_brand_info !== false && (
            <Stack
              direction={'row'}
              alignItems={'center'}
              gap={0.5}
              sx={{
                height: 40,
                lineHeight: '40px',
                color: 'rgba(255, 255, 255, 0.30)',
              }}
            >
            </Stack>
          )}
        </Box>
        <Overlay open={open} onClose={setOpen}>
          <Stack
            sx={{
              width: '270px',
              alignItems: 'center',
              borderRadius: '4px',
              boxShadow: '0px 4px 8px 0px rgba(255,255,255,0.25)',
              bgcolor: '#fff',
              padding: 3,
            }}
            gap={2}
          >
            {curOverlayType === 'wechat_oa' && (
              <>
                <img
                  src={wechatData?.src}
                  width={'222px'}
                  height={'222px'}
                ></img>
                <Box
                  sx={{
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: '#000',
                  }}
                >
                  {wechatData?.text}
                </Box>
              </>
            )}
            {curOverlayType === 'phone' && (
              <>
                <Box
                  sx={{
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: '#000',
                    width: '100%',
                  }}
                  onClick={() => {
                    window.location.href = `tel:${phoneData?.phone}`;
                  }}
                >
                  {phoneData?.phone}
                </Box>
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  width={'100%'}
                  sx={{
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: '#000',
                  }}
                  gap={1}
                >
                  <IconPhone
                    sx={{ fontSize: '22px', color: 'rgba(33, 34, 45, 0.70)' }}
                  ></IconPhone>
                  <Box
                    sx={{
                      fontSize: '24px',
                      lineHeight: '32px',
                      color: '#000',
                    }}
                  >
                    {phoneData?.text}
                  </Box>
                </Stack>
              </>
            )}
          </Stack>
        </Overlay>
      </>
    );

  return (
    <Box
      id='footer'
      style={{
        width: '100%',
      }}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        fontSize: '12px',
        zIndex: 1,
        color: '#fff',
        bgcolor: 'background.footer',
        ...(showBrand && {
          borderTop: '1px solid',
          borderColor: 'divider',
        }),
      }}
    >
      <Box
        sx={{
          width: '100%',
          ...(!isDocPage && {
            px: '15%',
          }),
          ...(isDocPage &&
            !mobile && {
              maxWidth: `calc(100vw - 80px)`,
              ...(docWidth !== 'full' && {
                width: `calc(${catalogWidth}px + 192px + 264px + ${DocWidth[docWidth as keyof typeof DocWidth].value}px)`,
              }),
            }),
        }}
      >
        {showBrand && (
          <Box
            py={
              customStyle?.footer_show_intro
                ? 6
                : (footerSetting?.brand_groups?.length || 0) > 0
                  ? 6
                  : 0
            }
          >
            <Stack
              direction={'row'}
              gap={10}
              justifyContent={
                customStyle?.footer_show_intro === false
                  ? 'center'
                  : 'flex-start'
              }
            >
              {customStyle?.footer_show_intro !== false && (
                <Stack
                  direction={'column'}
                  sx={{ width: '30%', minWidth: 200 }}
                  gap={3}
                >
                  {footerSetting?.brand_name && (
                    <Stack direction={'row'} alignItems={'center'} gap={1}>
                      {footerSetting?.brand_logo && (
                        <img
                          src={footerSetting.brand_logo}
                          alt='Wiki'
                          height={24}
                        />
                      )}
                      <Box
                        sx={{
                          fontWeight: 'bold',
                          lineHeight: '32px',
                          fontSize: 20,
                        }}
                      >
                        {footerSetting?.brand_name}
                      </Box>
                    </Stack>
                  )}
                  {footerSetting?.brand_desc && (
                    <Box
                      sx={{
                        fontSize: 12,
                        lineHeight: '26px',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {footerSetting.brand_desc}
                    </Box>
                  )}
                  <Stack direction={'column'} gap={'26px'}>
                    {customStyle?.social_media_accounts?.map(
                      (account, index) => {
                        return (
                          <Stack
                            direction={'row'}
                            key={index}
                            sx={{
                              position: 'relative',
                              '&:hover': { color: '#fff' },
                              '&:hover .popup': { display: 'flex !important' },
                              color: 'rgba(255, 255, 255, 0.70)',
                              cursor: 'default',
                            }}
                            gap={1}
                          >
                            {account.channel === 'wechat_oa' && (
                              <IconWechat
                                sx={{ fontSize: '20px', color: 'inherit' }}
                              ></IconWechat>
                            )}
                            {account.channel === 'phone' && (
                              <IconPhone
                                sx={{ fontSize: '20px', color: 'inherit' }}
                              ></IconPhone>
                            )}

                            <Box
                              sx={{
                                lineHeight: '24px',
                                fontSize: '12px',
                                color: 'inherit',
                              }}
                            >
                              {account.text}
                            </Box>
                            {account.channel === 'wechat_oa' &&
                              (account?.text || account?.icon) && (
                                <Stack
                                  className={'popup'}
                                  direction={'column'}
                                  alignItems={'center'}
                                  bgcolor={'#fff'}
                                  p={1.5}
                                  sx={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    transform: 'translateY(-10px)',
                                    left: 0,
                                    boxShadow:
                                      ' 0px 4px 8px 0px rgba(255,255,255,0.25)',
                                    borderRadius: '4px',
                                  }}
                                  gap={1}
                                  display={'none'}
                                  zIndex={999}
                                >
                                  {account.icon && (
                                    <img
                                      src={account.icon}
                                      width={120}
                                      height={120}
                                    ></img>
                                  )}
                                  {account.text && (
                                    <Box
                                      sx={{
                                        fontSize: '12px',
                                        lineHeight: '16px',
                                        color: '#21222D',
                                        maxWidth: '120px',
                                        textAlign: 'center',
                                      }}
                                    >
                                      {account.text}
                                    </Box>
                                  )}
                                </Stack>
                              )}
                            {account.channel === 'phone' && account?.phone && (
                              <Stack
                                className={'popup'}
                                bgcolor={'#fff'}
                                px={1.5}
                                py={1}
                                sx={{
                                  position: 'absolute',
                                  bottom: '100%',
                                  transform: 'translateY(-10px)',
                                  left: 0,
                                  boxShadow:
                                    ' 0px 4px 8px 0px rgba(255,255,255,0.25)',
                                  borderRadius: '4px',
                                }}
                                display={'none'}
                                zIndex={999}
                              >
                                {account.phone && (
                                  <Box
                                    sx={{
                                      fontSize: '12px',
                                      lineHeight: '16px',
                                      color: '#21222D',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {account.phone}
                                  </Box>
                                )}
                              </Stack>
                            )}
                          </Stack>
                        );
                      },
                    )}
                  </Stack>
                </Stack>
              )}

              <Stack
                direction={'row'}
                width={'100%'}
                justifyContent={
                  (footerSetting?.brand_groups?.length || 0) > 1
                    ? 'space-around'
                    : 'flex-start'
                }
              >
                {footerSetting?.brand_groups?.map(group => (
                  <Stack
                    gap={1.5}
                    key={group.name}
                    sx={{
                      fontSize: 12,
                      lineHeight: '22px',
                      minWidth: '100px',
                      '& a:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: 14,
                        lineHeight: '24px',
                        mb: 1,
                      }}
                    >
                      {group.name}
                    </Box>
                    {group.links?.map(link => (
                      <Box color={'rgba(255, 255, 255, 0.50)'} key={link.name}>
                        <Link
                          href={link?.url || ''}
                          target='_blank'
                          key={link.name}
                          prefetch={false}
                        >
                          {link.name}
                        </Link>
                      </Box>
                    ))}
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>
        )}
        {!(
          customStyle?.footer_show_intro === false &&
          footerSetting?.brand_groups?.length === 0
        ) && (
          <Stack
            sx={{
              bgcolor: 'rgba(236, 238, 241, 0.10)',
              width: '100%',
              height: '1px',
            }}
          ></Stack>
        )}
        <Box
          sx={{
            height: 40,
            lineHeight: '40px',
            textAlign: 'center',
          }}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <Stack
              direction={'row'}
              alignItems={'center'}
              gap={1}
              sx={{ color: 'rgba(255, 255, 255, 0.30)' }}
            >
              {!!footerSetting?.corp_name && (
                <Box>{footerSetting?.corp_name}</Box>
              )}
              {!!footerSetting?.icp && (
                <>
                  <Divider
                    orientation='vertical'
                    sx={{
                      mx: 0.5,
                      height: 16,
                      borderColor: 'rgba(255, 255, 255, 0.30)',
                    }}
                  />
                  <Link
                    href={`https://beian.miit.gov.cn/`}
                    target='_blank'
                    prefetch={false}
                  >
                    {footerSetting?.icp}
                  </Link>
                </>
              )}
              {customStyle?.show_brand_info !== false && (
                <>
                  {(footerSetting?.corp_name || footerSetting?.icp) && (
                    <Divider
                      orientation='vertical'
                      sx={{
                        mx: 0.5,
                        height: 16,
                        borderColor: 'rgba(255, 255, 255, 0.30)',
                      }}
                    />
                  )}
                  <Stack
                    direction={'row'}
                    alignItems={'center'}
                    gap={0.5}
                    sx={{ color: 'rgba(255, 255, 255, 0.30)' }}
                  >
                  </Stack>
                </>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export const FooterProvider = ({
  showBrand = true,
  isDocPage = false,
  isWelcomePage = false,
}: {
  showBrand?: boolean;
  isDocPage?: boolean;
  isWelcomePage?: boolean;
}) => {
  const { kbDetail, mobile = false, catalogShow, catalogWidth } = useStore();
  return (
    <Footer
      showBrand={showBrand}
      kbDetail={kbDetail}
      mobile={mobile}
      catalogShow={catalogShow}
      catalogWidth={catalogWidth}
      isDocPage={isDocPage}
      isWelcomePage={isWelcomePage}
    />
  );
};

export default Footer;
