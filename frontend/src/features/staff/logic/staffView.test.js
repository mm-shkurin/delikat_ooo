import { describe, expect, it } from 'vitest'
import { staffMeToView, staffMemberListToView, staffMemberToView } from './staffView'

describe('staffView', () => {
  it('maps staff me with role chip label', () => {
    expect(
      staffMeToView({
        user_id: 'u1',
        email: 'a@b.test',
        display_name: 'Ada',
        role: 'owner',
      }),
    ).toEqual({
      userId: 'u1',
      email: 'a@b.test',
      displayName: 'Ada',
      role: 'owner',
      roleLabel: 'Владелец',
    })
  })

  it('maps member fields including pending without name', () => {
    expect(
      staffMemberToView({
        member_id: 'm1',
        user_id: null,
        email: 'p@b.test',
        display_name: null,
        role: 'cashier',
        status: 'pending',
      }),
    ).toMatchObject({
      memberId: 'm1',
      email: 'p@b.test',
      displayName: null,
      role: 'cashier',
      status: 'pending',
      statusLabel: 'Ожидает вход',
    })
  })

  it('maps roster list', () => {
    const views = staffMemberListToView({
      items: [
        {
          member_id: 'm1',
          email: 'a@b.test',
          display_name: 'Ada',
          role: 'manager',
          status: 'active',
        },
      ],
    })
    expect(views).toHaveLength(1)
    expect(views[0].roleLabel).toBe('Менеджер')
  })
})
