import { Activity, AlertTriangle, Lock, ShieldCheck, Users } from 'lucide-react';
import { Badge, Button } from '@/shared/components';
import { useI18n } from '@/shared/lib/i18n';
import { useMockApp } from '@/shared/lib/mockStore';

export function AdminDashboard() {
  const { t, locale } = useI18n();
  const {
    friends,
    reports,
    auditLogs,
    suspendedUserIds,
    resolveReport,
  } = useMockApp();

  const openReportsCount = reports.filter((r) => r.status === 'open').length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-1 border-b border-[#E2DFD5] pb-5 dark:border-white/[0.08]">
        <h1 className="text-2xl font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
          {t('admin.title')}
        </h1>
        <p className="text-sm text-[#575D66] dark:text-[#8B949E]">{t('admin.subtitle')}</p>
      </header>

      {/* Zero-Access Privacy Guarantee Banner */}
      <section className="flex items-start gap-3.5 rounded-2xl border border-[#059669]/30 bg-[#059669]/[0.06] p-4 dark:border-[#10B981]/30 dark:bg-[#10B981]/10 sm:p-5">
        <Lock
          className="mt-0.5 h-5 w-5 shrink-0 text-[#059669] dark:text-[#10B981]"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
            {t('admin.privacyBannerTitle')}
          </h2>
          <p className="text-xs leading-relaxed text-[#575D66] dark:text-[#8B949E] sm:text-sm">
            {t('admin.privacyBannerDesc')}
          </p>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="fc-surface rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#575D66] dark:text-[#8B949E]">
            <span>{t('admin.kpiUsers')}</span>
            <Users className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#111315] dark:text-[#F3F5F7] tabular-nums">
            {friends.length + 142}
          </p>
        </div>

        <div className="fc-surface rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#575D66] dark:text-[#8B949E]">
            <span>{t('admin.kpiReports')}</span>
            <AlertTriangle className="h-4 w-4 text-[#D97706] dark:text-[#F59E0B]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#111315] dark:text-[#F3F5F7] tabular-nums">
            {openReportsCount}
          </p>
        </div>

        <div className="fc-surface rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#575D66] dark:text-[#8B949E]">
            <span>{t('admin.kpiHealth')}</span>
            <Activity className="h-4 w-4 text-[#059669] dark:text-[#10B981]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#059669] dark:text-[#10B981] tabular-nums">
            {t('admin.healthNominal')}
          </p>
        </div>
      </section>

      {/* Reports Triage Table */}
      <section className="fc-surface overflow-hidden rounded-2xl">
        <div className="border-b border-[#E2DFD5] px-5 py-4 dark:border-white/[0.08]">
          <h2 className="text-base font-semibold text-[#111315] dark:text-[#F3F5F7]">
            {t('admin.reportsTitle')}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-[#E2DFD5] bg-[#EFECE4]/55 text-[#575D66] dark:border-white/[0.08] dark:bg-[#191E24]/70 dark:text-[#8B949E]">
              <tr>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colTarget')}</th>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colReporter')}</th>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colReason')}</th>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colStatus')}</th>
                <th className="px-5 py-3 text-end font-medium">{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD5] dark:divide-white/[0.08]">
              {reports.map((report) => {
                const isSuspended = suspendedUserIds.includes(report.targetUserId);
                return (
                  <tr
                    key={report.id}
                    className="hover:bg-[#EFECE4]/35 dark:hover:bg-[#191E24]/45"
                  >
                    <td className="px-5 py-3.5 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-[#111315] dark:text-[#F3F5F7]">
                          @{report.targetUsername}
                        </span>
                        {isSuspended && (
                          <Badge variant="paused">{t('admin.suspendedTag')}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 align-top font-mono text-[#575D66] dark:text-[#8B949E]">
                      @{report.reporterUsername}
                    </td>
                    <td className="px-5 py-3.5 align-top max-w-xs">
                      <p className="font-medium text-[#111315] dark:text-[#F3F5F7]">
                        {locale === 'ar' ? report.reasonAr : report.reason}
                      </p>
                      <p className="mt-0.5 text-[#575D66] dark:text-[#8B949E]">
                        {locale === 'ar' ? report.detailsAr : report.details}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      {report.status === 'open' && (
                        <Badge variant="stale">{t('admin.statusOpen')}</Badge>
                      )}
                      {report.status === 'resolved' && (
                        <Badge variant="live">{t('admin.statusResolved')}</Badge>
                      )}
                      {report.status === 'dismissed' && (
                        <Badge variant="neutral">{t('admin.statusDismissed')}</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 align-top text-end">
                      {report.status === 'open' ? (
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => resolveReport(report.id, 'resolved')}
                          >
                            {t('admin.resolve')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveReport(report.id, 'dismissed')}
                          >
                            {t('admin.dismiss')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => resolveReport(report.id, 'suspended')}
                          >
                            {t('admin.suspend')}
                          </Button>
                        </div>
                      ) : (
                        <span className="font-mono text-[11px] text-[#575D66] dark:text-[#8B949E]">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Immutable Audit Logs Table */}
      <section className="fc-surface overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#E2DFD5] px-5 py-4 dark:border-white/[0.08]">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-[#111315] dark:text-[#F3F5F7]">
              {t('admin.auditTitle')}
            </h2>
            <p className="text-xs text-[#575D66] dark:text-[#8B949E]">
              {t('admin.auditSubtitle')}
            </p>
          </div>
          <ShieldCheck
            className="h-5 w-5 shrink-0 text-[#059669] dark:text-[#10B981]"
            aria-hidden="true"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start font-mono text-xs tabular-nums">
            <thead className="border-b border-[#E2DFD5] bg-[#EFECE4]/55 text-[#575D66] dark:border-white/[0.08] dark:bg-[#191E24]/70 dark:text-[#8B949E]">
              <tr>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colTimestamp')}</th>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colActor')}</th>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colAction')}</th>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colTarget')}</th>
                <th className="px-5 py-3 text-start font-medium">{t('admin.colMetadata')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD5] dark:divide-white/[0.08]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#EFECE4]/35 dark:hover:bg-[#191E24]/45">
                  <td className="px-5 py-3 text-[#575D66] dark:text-[#8B949E] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-5 py-3 text-[#111315] dark:text-[#F3F5F7] whitespace-nowrap">
                    @{log.actorUsername}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <Badge variant="neutral" mono>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-[#111315] dark:text-[#F3F5F7] whitespace-nowrap">
                    {log.targetUsername === '*' ? '*' : `@${log.targetUsername}`}
                  </td>
                  <td className="px-5 py-3 text-[#575D66] dark:text-[#8B949E] whitespace-nowrap">
                    {log.metadata}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
