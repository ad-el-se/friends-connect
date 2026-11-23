import { useState } from 'react';
import { EyeOff, ShieldAlert, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmDialog,
  LanguageToggle,
  PrecisionSelector,
  SpatialAvatar,
  ThemeToggle,
} from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/lib/i18n';
import { useMockApp } from '@/shared/lib/mockStore';
import type { LastSeenPrivacy, ShareExpiration } from '@/shared/types/domain';

export function PrivacySettingsScreen() {
  const { t, locale } = useI18n();
  const {
    currentUser,
    friends,
    isSharingGlobal,
    ghostMode,
    toggleGlobalSharing,
    toggleGhostMode,
    updateFriendShare,
    updatePrivacyLastSeen,
    deleteAccount,
  } = useMockApp();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const canConfirmDelete =
    deleteConfirmText.trim().toLowerCase() === currentUser.username.toLowerCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-1 border-b border-[#E2DFD5] pb-5 dark:border-white/[0.08]">
        <h1 className="text-2xl font-semibold tracking-tight text-[#111315] dark:text-[#F3F5F7]">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-[#575D66] dark:text-[#8B949E]">{t('settings.subtitle')}</p>
      </header>

      {/* Global Ghost / Freeze Mode + Live Broadcast Switch */}
      <section className="fc-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2DFD5] bg-[#EFECE4] text-[#111315] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7]">
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-[#111315] dark:text-[#F3F5F7]">
                  {t('settings.ghostTitle')}
                </h2>
                <Badge variant={ghostMode || !isSharingGlobal ? 'paused' : 'live'} pulse={!ghostMode && isSharingGlobal}>
                  {ghostMode
                    ? t('settings.ghostActiveBadge')
                    : isSharingGlobal
                      ? t('settings.ghostOffBadge')
                      : t('hud.paused')}
                </Badge>
              </div>
              <p className="max-w-2xl text-sm text-[#575D66] dark:text-[#8B949E]">
                {t('settings.ghostDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant={isSharingGlobal ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => toggleGlobalSharing(!isSharingGlobal)}
            >
              {isSharingGlobal ? t('hud.stop') : t('hud.resume')}
            </Button>

            <button
              type="button"
              role="switch"
              aria-checked={ghostMode}
              aria-label={t('settings.ghostTitle')}
              onClick={() => toggleGhostMode(!ghostMode)}
              className={cn(
                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors',
                ghostMode
                  ? 'bg-[#DC2626] dark:bg-[#EF4444]'
                  : 'bg-[#E2DFD5] dark:bg-white/15',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-6 w-6 rounded-full bg-white transition-transform duration-200',
                  ghostMode ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Per-Friend Location Sharing Matrix */}
      <section className="fc-surface rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#111315] dark:text-[#F3F5F7]">
            {t('settings.matrixTitle')}
          </h2>
          <p className="text-sm text-[#575D66] dark:text-[#8B949E]">
            {t('settings.matrixSubtitle')}
          </p>
        </div>

        <div className="divide-y divide-[#E2DFD5] rounded-2xl border border-[#E2DFD5] dark:divide-white/[0.08] dark:border-white/[0.08]">
          {friends.map((friend) => {
            const name = locale === 'ar' ? friend.displayNameAr : friend.displayName;
            return (
              <div
                key={friend.id}
                className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <SpatialAvatar
                    name={name}
                    src={friend.avatarUrl}
                    size="sm"
                    status={friend.shareToFriend.isActive ? 'live' : 'offline'}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111315] dark:text-[#F3F5F7]">
                      {name}
                    </p>
                    <p className="font-mono text-xs text-[#575D66] dark:text-[#8B949E]">
                      @{friend.username}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-full sm:w-64">
                    <PrecisionSelector
                      value={friend.shareToFriend.precision}
                      disabled={!friend.shareToFriend.isActive}
                      hideDescription
                      onChange={(nextPrecision) =>
                        updateFriendShare(friend.id, { precision: nextPrecision })
                      }
                    />
                  </div>

                  <select
                    aria-label={`Expiration for ${name}`}
                    value={friend.shareToFriend.expiresIn}
                    disabled={!friend.shareToFriend.isActive}
                    onChange={(e) =>
                      updateFriendShare(friend.id, {
                        expiresIn: e.target.value as ShareExpiration,
                      })
                    }
                    className="h-9 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/60 px-3 text-xs font-medium text-[#111315] outline-none disabled:opacity-50 dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7]"
                  >
                    <option value="15m">{t('settings.exp15m')}</option>
                    <option value="1h">{t('settings.exp1h')}</option>
                    <option value="8h">{t('settings.exp8h')}</option>
                    <option value="until_stopped">{t('settings.expUntil')}</option>
                  </select>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={friend.shareToFriend.isActive}
                    aria-label={`Toggle location sharing with ${name}`}
                    onClick={() =>
                      updateFriendShare(friend.id, {
                        isActive: !friend.shareToFriend.isActive,
                      })
                    }
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors',
                      friend.shareToFriend.isActive
                        ? 'bg-[#059669] dark:bg-[#10B981]'
                        : 'bg-[#E2DFD5] dark:bg-white/15',
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white transition-transform duration-200',
                        friend.shareToFriend.isActive
                          ? 'ltr:translate-x-5 rtl:-translate-x-5'
                          : 'translate-x-0',
                      )}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Profile Privacy + Appearance & Language */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="fc-surface rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111315] dark:text-[#F3F5F7]">
            {t('settings.profilePrivacyTitle')}
          </h2>
          <p className="text-xs text-[#575D66] dark:text-[#8B949E]">
            {t('settings.lastSeenLabel')}
          </p>

          <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#E2DFD5] bg-[#EFECE4] p-1 dark:border-white/[0.08] dark:bg-[#191E24]">
            {(
              [
                { value: 'everyone', label: t('settings.lastSeenEveryone') },
                { value: 'friends', label: t('settings.lastSeenFriends') },
                { value: 'nobody', label: t('settings.lastSeenNobody') },
              ] as Array<{ value: LastSeenPrivacy; label: string }>
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updatePrivacyLastSeen(opt.value)}
                className={cn(
                  'rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors',
                  currentUser.privacyLastSeen === opt.value
                    ? 'bg-[#FFFFFF] text-[#111315] border border-[#E2DFD5] dark:bg-[#111418] dark:text-[#F3F5F7] dark:border-white/[0.1]'
                    : 'border border-transparent text-[#575D66] dark:text-[#8B949E]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fc-surface rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111315] dark:text-[#F3F5F7]">
            {t('settings.appearanceTitle')}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-[#575D66] dark:text-[#8B949E]">
              {t('settings.themeLabel')}
            </span>
            <ThemeToggle />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2DFD5] pt-3 dark:border-white/[0.08]">
            <span className="text-xs font-medium text-[#575D66] dark:text-[#8B949E]">
              {t('settings.languageLabel')}
            </span>
            <LanguageToggle />
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-[#DC2626]/30 bg-[#DC2626]/[0.04] p-5 dark:border-[#EF4444]/30 dark:bg-[#EF4444]/[0.06] sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626] dark:text-[#EF4444]"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#111315] dark:text-[#F3F5F7]">
                {t('settings.dangerTitle')}
              </h2>
              <p className="text-sm text-[#575D66] dark:text-[#8B949E]">
                {t('settings.dangerDesc')}
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            onClick={() => {
              setDeleteConfirmText('');
              setIsDeleteOpen(true);
            }}
          >
            {t('settings.deleteBtn')}
          </Button>
        </div>
      </section>

      {/* Account Deletion ConfirmDialog requiring @username confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (!canConfirmDelete) return;
          setIsDeleteOpen(false);
          deleteAccount();
        }}
        title={t('settings.deleteModalTitle')}
        description={t('settings.deleteModalDesc', { username: currentUser.username })}
        confirmLabel={t('settings.deleteConfirmBtn')}
        cancelLabel={t('common.cancel')}
        variant="danger"
      >
        <div className="space-y-1.5 pt-1">
          <label
            htmlFor="delete-username-confirm"
            className="block text-xs font-medium text-[#111315] dark:text-[#F3F5F7]"
          >
            {t('settings.deleteInputLabel', { username: currentUser.username })}
          </label>
          <input
            id="delete-username-confirm"
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={currentUser.username}
            dir="ltr"
            className="w-full rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 px-3.5 py-2 font-mono text-sm text-[#111315] outline-none focus:border-[#DC2626] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#EF4444]"
          />
          {!canConfirmDelete && deleteConfirmText.length > 0 && (
            <p className="font-mono text-[11px] text-[#DC2626] dark:text-[#EF4444]">
              Must match @{currentUser.username}
            </p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
