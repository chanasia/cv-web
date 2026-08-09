import { useDeferredValue, useLayoutEffect, useMemo, useState } from 'react'
import { MobileTabs, type Pane } from './components/MobileTabs'
import { EditorPane } from './components/editor/EditorPane'
import { MeasureLayer } from './components/preview/MeasureLayer'
import { PreviewPane } from './components/preview/PreviewPane'
import { Splitter } from './components/ui/Splitter'
import { usePagination } from './hooks/usePagination'
import { flattenToBlocks } from './lib/blocks'
import { useActiveCv, useCvStore } from './store/useCvStore'

export default function App() {
  const cv = useActiveCv()
  const dark = useCvStore((s) => s.ui.dark)
  const setEditorWidth = useCvStore((s) => s.setEditorWidth)
  const [pane, setPane] = useState<Pane>('preview')

  // The preview trails typing by a frame under load, so a keystroke never waits
  // on re-measuring the whole document.
  const deferredCv = useDeferredValue(cv)
  const blocks = useMemo(() => flattenToBlocks(deferredCv), [deferredCv])
  const { measureRef, pages, pageWidth, pageHeight } = usePagination(blocks)

  // Layout effect, not effect: this runs before the browser paints, so a stored
  // light preference never flashes the dark default first.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Below `lg` only one pane is on screen at a time. The split needs 1024px to
  // be worth having: at 768 the sheet is squeezed to about 300px and the type
  // is too small to read, so tablets in portrait get the tabs too.
  //
  // `print:flex!` on the preview matters: printing while the form is open must
  // still produce the sheet, and without it the hidden pane would print nothing.
  const paneClass = (owner: Pane) =>
    `${pane === owner ? 'flex' : 'hidden'} lg:flex ${owner === 'preview' ? 'print:flex!' : ''}`

  return (
    // h-dvh, not h-screen: on mobile browsers the address bar makes 100vh taller
    // than the visible area, which would push the editor off the bottom.
    <div className="flex h-dvh flex-col overflow-hidden print:block print:h-auto print:overflow-visible">
      <MobileTabs pane={pane} onChange={setPane} pageCount={pages.length} />

      <div className="flex min-h-0 flex-1 print:block">
        <PreviewPane
          pages={pages}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          className={paneClass('preview')}
        />
        <Splitter onResize={setEditorWidth} />
        <EditorPane cv={cv} pageCount={pages.length} className={paneClass('edit')} />
      </div>

      {/* Outside every scaled or scrolling container, by necessity. */}
      <MeasureLayer blocks={blocks} ref={measureRef} />
    </div>
  )
}
