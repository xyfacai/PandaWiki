import notFound from '@/assets/images/404.png';
import { FooterProvider } from '@/components/footer';
import { Box, Stack } from '@mui/material';
import Image from 'next/image';

export default function NotFound() {
  return (
    <Box
      sx={{
        position: 'relative',
        pt: 28,
        height: '100vh',
      }}
    >
      <Stack
        sx={{
          maxWidth: 1200,
          overflow: 'auto',
          pb: 6,
          mx: 'auto',
        }}
        justifyContent='center'
        alignItems='center'
      >
        <Image src={notFound.src} alt='404' width={380} height={200} />
        <Stack
          gap={3}
          alignItems='center'
          sx={{ color: 'text.tertiary', fontSize: 14, mt: 3 }}
        >
          页面不存在
        </Stack>
      </Stack>
      <Box
        sx={{
          height: 40,
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <FooterProvider showBrand={false} fullWidth={true} />
      </Box>
    </Box>
  );
}
