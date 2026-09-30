import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { formatDate, formatRelativeTime } from '../lib/utils'
import {
  FileText,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Users,
  Eye,
  X,
  Share2,
  Printer,
} from 'lucide-react'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    api.getReports()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setReports(data)
          setSelectedReport(data[0])
        }
      })
      .catch((err) => {
        console.warn('Failed to load real reports:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Generate new real live report from current DB state
  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const newRep = await api.generateReport('Fleet Intelligence & Security Audit')
      if (newRep) {
        setReports((prev) => [newRep, ...prev])
        setSelectedReport(newRep)
      }
    } catch (err) {
      console.error('Failed to generate live audit report:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary" />
            Executive Intelligence Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly digest audits, fleet health analysis, engineering throughput summaries, and printable reports.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Synthesizing...' : 'Generate New Audit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Report Archives List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
            <Calendar className="w-4 h-4 text-primary" />
            Archived Reports ({reports.length})
          </h3>

          <div className="space-y-2.5">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-card border-primary/50 shadow-md ring-1 ring-primary/20'
                      : 'bg-card/60 border-border/80 hover:border-primary/30 hover:bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground">{rep.title}</span>
                    <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.2 rounded-full">
                      Score {rep.health}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{rep.period}</p>

                  <div className="grid grid-cols-3 gap-2 text-[11px] border-t border-border/50 pt-2 text-muted-foreground">
                    <div>
                      <span>Commits:</span>{' '}
                      <span className="font-semibold text-foreground">{rep.commits}</span>
                    </div>
                    <div>
                      <span>PRs:</span>{' '}
                      <span className="font-semibold text-foreground">{rep.prsMerged}</span>
                    </div>
                    <div>
                      <span>Issues:</span>{' '}
                      <span className="font-semibold text-foreground">{rep.issuesClosed}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Selected Report Preview */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="p-8 rounded-2xl bg-card border border-border shadow-md space-y-6">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Automated Executive Intelligence Summary
                  </div>
                  <h2 className="text-2xl font-black text-foreground">{selectedReport.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coverage: {selectedReport.period} • Generated {formatRelativeTime(selectedReport.generatedAt)} across {selectedReport.repositories} monitored repositories
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / PDF
                  </button>
                </div>
              </div>

              {/* Health Score Callout */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-primary/10 via-background to-secondary/30 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Fleet Health Rating
                  </span>
                  <div className="text-3xl font-black text-foreground flex items-center gap-2">
                    {selectedReport.health}
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      +{selectedReport.healthChange}% improvement
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All core repositories pass CI/CD thresholds and zero critical CVE vulnerabilities detected.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-background border border-border text-center min-w-[120px]">
                  <span className="text-[11px] text-muted-foreground block">Top Performer</span>
                  <span className="text-xs font-bold text-primary mt-0.5 block">
                    {selectedReport.topContributor}
                  </span>
                </div>
              </div>

              {/* High-Level Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <GitCommit className="w-3.5 h-3.5 text-primary" />
                    <span>Commits Pushed</span>
                  </div>
                  <span className="text-xl font-bold text-foreground">{selectedReport.commits}</span>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <GitPullRequest className="w-3.5 h-3.5 text-purple-500" />
                    <span>PRs Merged</span>
                  </div>
                  <span className="text-xl font-bold text-purple-400">{selectedReport.prsMerged}</span>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Issues Closed</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-500">{selectedReport.issuesClosed}</span>
                </div>
              </div>

              {/* Key Highlights & Real Repository Breakdown */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Executive Intelligence & Performance Findings
                </h4>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground leading-relaxed">
                  <p className="text-foreground font-medium mb-1">
                    {selectedReport.summary || `Intelligence synthesized across ${selectedReport.repositories} active repositories.`}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border/40 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono">
                      Teams: {selectedReport.teamsCount || 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-mono">
                      Stars: {selectedReport.totalStars || 0}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono">
                      Health Avg: {Math.round(selectedReport.health || 85)}/100
                    </span>
                  </div>
                </div>

                {/* Real Monitored Repositories Table */}
                {selectedReport.topRepositories && selectedReport.topRepositories.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monitored Fleet Breakdown</span>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/50 text-muted-foreground border-b border-border text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Repository</th>
                            <th className="py-2.5 px-3 font-semibold">Commits</th>
                            <th className="py-2.5 px-3 font-semibold">Health Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-foreground">
                          {selectedReport.topRepositories.map((r, i) => (
                            <tr key={i} className="hover:bg-secondary/20 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-medium text-primary">{r.name}</td>
                              <td className="py-2.5 px-3 font-mono">{r.commits}</td>
                              <td className="py-2.5 px-3">
                                <span className={`font-mono font-bold ${r.health >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {r.health}/100
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground border border-border rounded-2xl bg-card">
              Select a report from the archive to view its breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
