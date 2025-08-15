import { Box, Stack } from "@mui/material";
import { TocList } from "@yu-cq/tiptap";
import { Ellipsis } from "ct-mui";

interface EditorDocNavProps {
  headers: TocList
}

const HeadingSx = [
  { fontSize: 14, fontWeight: 400, color: 'text.secondary' },
  { fontSize: 14, fontWeight: 400, color: 'text.auxiliary' },
  { fontSize: 14, fontWeight: 400, color: 'text.disabled' },
];

const EditorDocNav = ({ headers }: EditorDocNavProps) => {
  const levels = Array.from(new Set(headers.map(it => it.level).sort((a, b) => a - b))).slice(0, 3)

  return <Stack sx={{
    width: 292,
    borderRadius: '6px',
    bgcolor: 'background.paper',
  }}>
    <Box sx={{
      p: 2,
      px: 3,
      fontSize: 16,
      fontWeight: 'bold',
      borderBottom: '2px solid',
      borderColor: 'divider',
    }}>内容大纲</Box>
    <Stack gap={1} sx={{
      py: 2,
      px: 3,
      maxHeight: 'calc(100vh - 478px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
    }}>
      {headers.filter(header => levels.includes(header.level)).map(header => {
        const idx = levels.indexOf(header.level)
        return <Stack key={header.id} direction={'row'} alignItems={'center'} gap={1} sx={{
          cursor: 'pointer',
          ':hover': {
            color: 'primary.main',
          },
          ml: idx * 2,
          ...HeadingSx[idx],
          color: header.isActive ? 'primary.main' : HeadingSx[idx]?.color ?? 'inherit'
        }} onClick={() => {
          const element = document.getElementById(header.id)
          if (element) {
            const offset = 100
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offset
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            })
          }
        }}>
          <Ellipsis arrow>{header.textContent}</Ellipsis>
        </Stack>
      })}
    </Stack>
  </Stack>
};

export default EditorDocNav;
