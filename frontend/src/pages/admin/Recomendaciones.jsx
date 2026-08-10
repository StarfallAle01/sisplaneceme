import { useState, useEffect, useCallback } from "react"
import { Award, BookOpen, Loader2, AlertCircle, ArrowRight, Sparkles, Layers, FlaskConical } from "lucide-react"
import api from "../../services/api"

const NAVY     = "#0A1628"
const NAVY_LT  = "#112240"
const NAVY_MID = "#2B4C7A"
const GOLD     = "#C5A028"
const TEXT_LT  = "#E2E8F0"
const DIM_LT   = "#94A3B8"

function BarraScore({ score, maxScore }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  return (
    <div className="w-full h-1.5 rounded-full mt-1.5" style={{ backgroundColor: "#ffffff10" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: pct + "%", backgroundColor: pct > 60 ? "#10B981" : pct > 30 ? GOLD : "#F59E0B" }}
      />
    </div>
  )
}

function colorScore(score) {
  return score > 60 ? "#10B981" : score > 30 ? GOLD : "#F59E0B"
}

function BannerDemo() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
      style={{ backgroundColor: "#7C3AED18", border: "1px solid #7C3AED35", color: "#C4B5FD" }}
    >
      <FlaskConical size={15} className="shrink-0" />
      <span>
        <strong>Modo demostración.</strong> La base de datos no contiene docentes con rol "profesor" o una malla activa con unidades.
        Se muestran datos ficticios para ilustrar el funcionamiento del motor TF-IDF.
      </span>
    </div>
  )
}

export default function Recomendaciones() {
  const [matriz, setMatriz]           = useState([])
  const [docentes, setDocentes]       = useState([])
  const [ucs, setUcs]                 = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [isDemo, setIsDemo]           = useState(false)
  const [tab, setTab]                 = useState("matriz")

  const [selectedUC, setSelectedUC]   = useState("")
  const [selectedDoc, setSelectedDoc] = useState("")
  const [ucRecs, setUcRecs]           = useState([])
  const [docRecs, setDocRecs]         = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [errorRecs, setErrorRecs]     = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: datosResp } = await api.get("/recomendaciones/datos")
      setDocentes(datosResp.docentes || [])
      setUcs(datosResp.ucs || [])
      setIsDemo(!!datosResp._demo)

      const { data: matResp } = await api.get("/recomendaciones/matriz")
      setMatriz(Array.isArray(matResp.matriz) ? matResp.matriz : [])
    } catch (err) {
      setError(err.message || "Error al cargar datos de recomendaciones")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const fetchRecsUC = useCallback(async (ucId) => {
    if (!ucId) { setUcRecs([]); setErrorRecs(null); return }
    try {
      setLoadingRecs(true)
      setErrorRecs(null)
      const { data } = await api.get("/recomendaciones/docentes/" + ucId)
      setUcRecs(Array.isArray(data.recomendaciones) ? data.recomendaciones : [])
    } catch (err) {
      setErrorRecs(err.message || "Error al cargar recomendaciones")
      setUcRecs([])
    } finally {
      setLoadingRecs(false)
    }
  }, [])

  const fetchRecsDoc = useCallback(async (docId) => {
    if (!docId) { setDocRecs([]); setErrorRecs(null); return }
    try {
      setLoadingRecs(true)
      setErrorRecs(null)
      const { data } = await api.get("/recomendaciones/ucs/" + docId)
      setDocRecs(Array.isArray(data.recomendaciones) ? data.recomendaciones : [])
    } catch (err) {
      setErrorRecs(err.message || "Error al cargar recomendaciones")
      setDocRecs([])
    } finally {
      setLoadingRecs(false)
    }
  }, [])

  useEffect(() => { fetchRecsUC(selectedUC) }, [selectedUC, fetchRecsUC])
  useEffect(() => { fetchRecsDoc(selectedDoc) }, [selectedDoc, fetchRecsDoc])

  // Reset error de tabs al cambiar de pestaña
  useEffect(() => { setErrorRecs(null) }, [tab])

  const maxScoreMatriz = matriz.reduce((max, row) => {
    const rowMax = row.recomendaciones?.[0]?.score || 0
    return rowMax > max ? rowMax : max
  }, 0)

  const maxScoreUC  = ucRecs[0]?.score || 0
  const maxScoreDoc = docRecs[0]?.score || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 size={44} className="mx-auto mb-4 animate-spin" style={{ color: GOLD }} />
          <p style={{ color: DIM_LT, fontSize: "15px" }}>Analizando perfiles y generando recomendaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Cabecera */}
      <div
        className="rounded-xl px-7 py-6"
        style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, " + NAVY_LT + " 100%)", border: "1px solid " + GOLD + "18" }}
      >
        <h1 className="font-heading font-bold tracking-tight" style={{ color: GOLD, fontSize: "26px", lineHeight: "1.2" }}>
          <Sparkles size={22} className="inline mr-2" style={{ verticalAlign: "-4px" }} />
          Recomendaciones Inteligentes
        </h1>
        <p style={{ color: DIM_LT, fontSize: "14px", marginTop: "4px" }}>
          Motor TF-IDF + Similitud de Coseno. Asignación óptima de docentes a unidades de competencia
        </p>
      </div>

      {/* Banner demo */}
      {isDemo && <BannerDemo />}

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#7F1D1D12", border: "1px solid #7F1D1D2A", color: "#FCA5A5" }}>
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchData}
            className="text-xs font-medium px-3 py-1 rounded transition-colors"
            style={{ color: "#FCA5A5", border: "1px solid #FCA5A540" }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* Pestañas */}
          <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "12" }}>
            {[
              { key: "matriz",   label: "Matriz Completa", icon: Layers },
              { key: "uc",      label: "Por Asignatura",  icon: BookOpen },
              { key: "docente", label: "Por Docente",     icon: Award },
            ].map((t) => {
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ backgroundColor: active ? GOLD : "transparent", color: active ? NAVY : DIM_LT }}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* ── TAB: MATRIZ COMPLETA ─────────────────────────────────────── */}
          {tab === "matriz" && (
            <div className="space-y-4">
              {matriz.length === 0 ? (
                <div className="rounded-xl p-16 text-center" style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "0E" }}>
                  <Sparkles size={48} className="mx-auto mb-4" style={{ color: GOLD, opacity: 0.25 }} />
                  <p style={{ color: DIM_LT }}>No se encontraron datos para generar la matriz.</p>
                </div>
              ) : (
                matriz.map((row) => (
                  <div key={row.uc.id} className="rounded-xl p-5" style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "10" }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: GOLD + "18" }}>
                        <BookOpen size={18} style={{ color: GOLD }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono font-medium mb-0.5" style={{ color: GOLD, opacity: 0.8 }}>
                          {row.uc.codigo}
                        </p>
                        <h3 className="font-heading font-semibold text-sm leading-snug" style={{ color: TEXT_LT }}>
                          {row.uc.nombre}
                        </h3>
                      </div>
                    </div>

                    {row.recomendaciones.length === 0 ? (
                      <p className="text-xs" style={{ color: DIM_LT }}>Sin recomendaciones disponibles.</p>
                    ) : (
                      <div className="space-y-2">
                        {row.recomendaciones.map((rec, i) => (
                          <div
                            key={rec.docente.id}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                            style={{ backgroundColor: NAVY_LT }}
                          >
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: i === 0 ? GOLD + "30" : "#ffffff10", color: i === 0 ? GOLD : DIM_LT }}
                            >
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium truncate" style={{ color: TEXT_LT }}>
                                  {rec.docente.grado ? rec.docente.grado + " " : ""}{rec.docente.nombre} {rec.docente.apellidos}
                                </span>
                                <span className="text-xs font-mono font-bold shrink-0" style={{ color: colorScore(rec.score) }}>
                                  {rec.score}%
                                </span>
                              </div>
                              <BarraScore score={rec.score} maxScore={maxScoreMatriz} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: POR ASIGNATURA ──────────────────────────────────────── */}
          {tab === "uc" && (
            <div className="space-y-4">
              <select
                value={selectedUC}
                onChange={(e) => setSelectedUC(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none text-sm"
                style={{ backgroundColor: NAVY, color: TEXT_LT, border: "1px solid " + GOLD + "30" }}
              >
                <option value="" style={{ backgroundColor: NAVY }}>Seleccionar unidad de competencia...</option>
                {ucs.map((uc) => (
                  <option key={uc.id} value={uc.id} style={{ backgroundColor: NAVY }}>
                    {uc.codigo} — {uc.nombre.length > 80 ? uc.nombre.slice(0, 80) + "…" : uc.nombre}
                  </option>
                ))}
              </select>

              {errorRecs && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#7F1D1D12", border: "1px solid #7F1D1D2A", color: "#FCA5A5" }}>
                  <AlertCircle size={14} /> {errorRecs}
                </div>
              )}

              {loadingRecs ? (
                <div className="text-center py-12">
                  <Loader2 size={28} className="mx-auto animate-spin" style={{ color: GOLD }} />
                </div>
              ) : selectedUC && !errorRecs && ucRecs.length === 0 ? (
                <div className="rounded-xl p-12 text-center" style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "0E" }}>
                  <Award size={40} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.25 }} />
                  <p style={{ color: DIM_LT }}>No se encontraron recomendaciones para esta asignatura.</p>
                </div>
              ) : (
                ucRecs.map((rec, i) => (
                  <div
                    key={rec.docente.id}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl"
                    style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "10" }}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: i === 0 ? GOLD + "30" : "#ffffff10", color: i === 0 ? GOLD : DIM_LT }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold" style={{ color: TEXT_LT, fontSize: "15px" }}>
                          {rec.docente.grado ? rec.docente.grado + " " : ""}{rec.docente.nombre} {rec.docente.apellidos}
                        </span>
                        <span className="text-sm font-mono font-bold shrink-0" style={{ color: colorScore(rec.score) }}>
                          {rec.score}%
                        </span>
                      </div>
                      <BarraScore score={rec.score} maxScore={maxScoreUC} />
                    </div>
                    <ArrowRight size={16} style={{ color: GOLD, opacity: 0.4 }} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: POR DOCENTE ─────────────────────────────────────────── */}
          {tab === "docente" && (
            <div className="space-y-4">
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none text-sm"
                style={{ backgroundColor: NAVY, color: TEXT_LT, border: "1px solid " + GOLD + "30" }}
              >
                <option value="" style={{ backgroundColor: NAVY }}>Seleccionar docente...</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id} style={{ backgroundColor: NAVY }}>
                    {d.grado ? d.grado + " — " : ""}{d.nombre} {d.apellidos}
                  </option>
                ))}
              </select>

              {errorRecs && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#7F1D1D12", border: "1px solid #7F1D1D2A", color: "#FCA5A5" }}>
                  <AlertCircle size={14} /> {errorRecs}
                </div>
              )}

              {loadingRecs ? (
                <div className="text-center py-12">
                  <Loader2 size={28} className="mx-auto animate-spin" style={{ color: GOLD }} />
                </div>
              ) : selectedDoc && !errorRecs && docRecs.length === 0 ? (
                <div className="rounded-xl p-12 text-center" style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "0E" }}>
                  <BookOpen size={40} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.25 }} />
                  <p style={{ color: DIM_LT }}>No se encontraron recomendaciones para este docente.</p>
                </div>
              ) : (
                docRecs.map((rec, i) => (
                  <div
                    key={rec.uc.id}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl"
                    style={{ backgroundColor: NAVY, border: "1px solid " + GOLD + "10" }}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: i === 0 ? GOLD + "30" : "#ffffff10", color: i === 0 ? GOLD : DIM_LT }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-medium mr-2" style={{ color: GOLD, opacity: 0.8 }}>
                            {rec.uc.codigo}
                          </span>
                          <span className="text-sm font-medium" style={{ color: TEXT_LT }}>
                            {rec.uc.nombre}
                          </span>
                        </div>
                        <span className="text-sm font-mono font-bold shrink-0 ml-2" style={{ color: colorScore(rec.score) }}>
                          {rec.score}%
                        </span>
                      </div>
                      <BarraScore score={rec.score} maxScore={maxScoreDoc} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
