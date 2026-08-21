import { useEffect, useRef } from 'react'

interface Props {
  moves: string[]
}

export default function MoveHistory({ moves }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [moves.length])

  const pairs: [string, string | undefined][] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]])
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        Move History
      </h3>
      <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: '220px' }}>
        {pairs.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No moves yet</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {pairs.map(([white, black], i) => (
                <tr
                  key={i}
                  className="border-b border-slate-700/50"
                >
                  <td className="py-0.5 pr-2 text-slate-500 w-6 text-right">{i + 1}.</td>
                  <td className="py-0.5 px-2 text-slate-200 font-mono w-20">{white}</td>
                  <td className="py-0.5 px-2 text-slate-300 font-mono">{black ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
