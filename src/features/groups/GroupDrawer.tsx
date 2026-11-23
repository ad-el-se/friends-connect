import { useEffect, useState } from 'react';
import { BellOff, Check, Crown, LogOut, Shield, Trash2, Users } from 'lucide-react';
import {
  Badge,
  BottomSheet,
  Button,
  ConfirmDialog,
  SpatialAvatar,
} from '@/shared/components';
import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/lib/i18n';
import { useMockApp } from '@/shared/lib/mockStore';
import type { Conversation } from '@/shared/types/domain';

export interface GroupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'manage';
  conversation?: Conversation | null;
}

export function GroupDrawer({
  isOpen,
  onClose,
  mode,
  conversation,
}: GroupDrawerProps) {
  const { t, locale } = useI18n();
  const {
    currentUser,
    friends,
    createGroup,
    updateGroupTitle,
    toggleMuteConversation,
    updateGroupMemberRole,
    removeGroupMember,
    leaveGroup,
  } = useMockApp();

  const [newTitle, setNewTitle] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [editTitle, setEditTitle] = useState('');
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  useEffect(() => {
    if (mode === 'manage' && conversation) {
      setEditTitle(
        locale === 'ar' ? (conversation.titleAr ?? conversation.title) : conversation.title,
      );
    } else if (mode === 'create') {
      setNewTitle('');
      setSelectedFriendIds(friends.slice(0, 2).map((f) => f.id));
    }
  }, [mode, conversation, isOpen, locale, friends]);

  const toggleFriendSelection = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCreate = () => {
    if (!newTitle.trim() || selectedFriendIds.length === 0) return;
    createGroup(newTitle, selectedFriendIds);
    onClose();
  };

  const resolveMemberProfile = (userId: string) => {
    if (userId === currentUser.id) return currentUser;
    return friends.find((f) => f.id === userId);
  };

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'create' ? t('group.createTitle') : t('group.manageTitle')}
        description={mode === 'create' ? t('group.createDesc') : t('group.manageDesc')}
        footer={
          mode === 'create' ? (
            <>
              <Button variant="secondary" size="sm" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!newTitle.trim() || selectedFriendIds.length === 0}
                onClick={handleCreate}
              >
                {t('group.createBtn')}
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t('common.close')}
            </Button>
          )
        }
      >
        {mode === 'create' ? (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="new-group-title"
                className="block text-xs font-medium text-[#111315] dark:text-[#F3F5F7]"
              >
                {t('group.titleLabel')}
              </label>
              <input
                id="new-group-title"
                type="text"
                placeholder={t('group.titlePlaceholder')}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 px-3.5 py-2.5 text-sm text-[#111315] outline-none focus:border-[#0066FF] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[#111315] dark:text-[#F3F5F7]">
                {t('group.selectMembers')} ({selectedFriendIds.length})
              </p>
              <div className="max-h-60 divide-y divide-[#E2DFD5] overflow-y-auto rounded-xl border border-[#E2DFD5] dark:divide-white/[0.08] dark:border-white/[0.08]">
                {friends.map((friend) => {
                  const isChecked = selectedFriendIds.includes(friend.id);
                  const name = locale === 'ar' ? friend.displayNameAr : friend.displayName;
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => toggleFriendSelection(friend.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 p-3 text-start cursor-pointer transition-colors',
                        isChecked
                          ? 'bg-[#0066FF]/[0.06] dark:bg-[#3B82F6]/10'
                          : 'hover:bg-[#EFECE4]/60 dark:hover:bg-[#191E24]/60',
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SpatialAvatar name={name} src={friend.avatarUrl} size="sm" status="none" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#111315] dark:text-[#F3F5F7]">
                            {name}
                          </p>
                          <p className="font-mono text-[11px] text-[#575D66] dark:text-[#8B949E]">
                            @{friend.username}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                          isChecked
                            ? 'border-[#0066FF] bg-[#0066FF] text-white dark:border-[#3B82F6] dark:bg-[#3B82F6]'
                            : 'border-[#E2DFD5] dark:border-white/20',
                        )}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : conversation ? (
          <div className="space-y-5">
            {/* Edit Group Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-group-title"
                className="block text-xs font-medium text-[#111315] dark:text-[#F3F5F7]"
              >
                {t('group.titleLabel')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="edit-group-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/50 px-3.5 py-2 text-sm text-[#111315] outline-none focus:border-[#0066FF] dark:border-white/[0.1] dark:bg-[#191E24] dark:text-[#F3F5F7] dark:focus:border-[#3B82F6]"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateGroupTitle(conversation.id, editTitle)}
                >
                  {t('group.saveTitleBtn')}
                </Button>
              </div>
            </div>

            {/* Mute Toggle */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E2DFD5] bg-[#EFECE4]/45 p-3.5 dark:border-white/[0.08] dark:bg-[#191E24]/60">
              <div className="flex items-start gap-2.5 min-w-0">
                <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-[#575D66] dark:text-[#8B949E]" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111315] dark:text-[#F3F5F7]">
                    {t('group.muteNotifications')}
                  </p>
                  <p className="text-xs text-[#575D66] dark:text-[#8B949E]">
                    {t('group.muteDesc')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={conversation.isMuted}
                onClick={() => toggleMuteConversation(conversation.id)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors',
                  conversation.isMuted
                    ? 'bg-[#0066FF] dark:bg-[#3B82F6]'
                    : 'bg-[#E2DFD5] dark:bg-white/15',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white transition-transform duration-200',
                    conversation.isMuted
                      ? 'ltr:translate-x-5 rtl:-translate-x-5'
                      : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            {/* Members & Roles */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#111315] dark:text-[#F3F5F7]">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {t('group.membersHeader')} ({conversation.members?.length ?? 0})
                  </span>
                </span>
              </div>

              <div className="divide-y divide-[#E2DFD5] rounded-xl border border-[#E2DFD5] dark:divide-white/[0.08] dark:border-white/[0.08]">
                {(conversation.members ?? []).map((member) => {
                  const profile = resolveMemberProfile(member.userId);
                  if (!profile) return null;
                  const isSelf = profile.id === currentUser.id;
                  const name = locale === 'ar' ? profile.displayNameAr : profile.displayName;

                  return (
                    <div
                      key={member.userId}
                      className="flex flex-wrap items-center justify-between gap-2 p-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SpatialAvatar name={name} src={profile.avatarUrl} size="sm" status="none" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-semibold text-[#111315] dark:text-[#F3F5F7]">
                              {name}
                            </span>
                            {member.role === 'owner' && (
                              <Badge
                                variant="admin"
                                icon={<Crown className="h-3 w-3" aria-hidden="true" />}
                              >
                                {t('group.roleOwner')}
                              </Badge>
                            )}
                            {member.role === 'admin' && (
                              <Badge
                                variant="approximate"
                                icon={<Shield className="h-3 w-3" aria-hidden="true" />}
                              >
                                {t('group.roleAdmin')}
                              </Badge>
                            )}
                            {member.role === 'member' && (
                              <Badge variant="neutral">{t('group.roleMember')}</Badge>
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-[#575D66] dark:text-[#8B949E]">
                            @{profile.username}
                          </p>
                        </div>
                      </div>

                      {!isSelf && member.role !== 'owner' && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateGroupMemberRole(
                                conversation.id,
                                member.userId,
                                member.role === 'admin' ? 'member' : 'admin',
                              )
                            }
                          >
                            {member.role === 'admin' ? t('group.demote') : t('group.promote')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={t('group.removeMember')}
                            onClick={() => removeGroupMember(conversation.id, member.userId)}
                            className="text-[#DC2626] hover:text-[#DC2626] dark:text-[#EF4444]"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#E2DFD5] pt-4 dark:border-white/[0.08]">
              <Button
                variant="danger"
                size="sm"
                fullWidth
                leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setIsLeaveConfirmOpen(true)}
              >
                {t('group.leaveBtn')}
              </Button>
            </div>
          </div>
        ) : null}
      </BottomSheet>

      {conversation && (
        <ConfirmDialog
          isOpen={isLeaveConfirmOpen}
          onClose={() => setIsLeaveConfirmOpen(false)}
          onConfirm={() => {
            leaveGroup(conversation.id);
            setIsLeaveConfirmOpen(false);
            onClose();
          }}
          title={t('group.leaveConfirmTitle')}
          description={t('group.leaveConfirmDesc')}
          confirmLabel={t('group.leaveBtn')}
          cancelLabel={t('common.cancel')}
          variant="danger"
        />
      )}
    </>
  );
}
