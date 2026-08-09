import { useDeferredValue, useLayoutEffect, useMemo } from 'react'
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

  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      <PreviewPane pages={pages} pageWidth={pageWidth} pageHeight={pageHeight} />
      <Splitter onResize={setEditorWidth} />
      <EditorPane cv={cv} pageCount={pages.length} />

      {/* Outside every scaled or scrolling container, by necessity. */}
      <MeasureLayer blocks={blocks} ref={measureRef} />
    </div>
  )
}
