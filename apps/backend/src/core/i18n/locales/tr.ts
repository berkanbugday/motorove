export const trTranslations = {
  notifications: {
    system: {
      title: 'Sistem Bildirimi',
      body: 'Sistem güncellemesi mevcut',
    },
    post: {
      shared_in_group: {
        title: "{{groupName}}'da Yeni Gönderi",
        body: "{{userFullName}}, {{groupName}}'da yeni bir gönderi paylaştı",
      },
      like: {
        title: 'Gönderi Beğenildi',
        body: '{{userFullName}} gönderinizi beğendi',
      },
      comment: {
        title: 'Yeni Yorum',
        body: '{{userFullName}} gönderinize yorum yaptı: "{{comment}}"',
      },
      save: {
        title: 'Gönderi Kaydedildi',
        body: '{{userFullName}} gönderinizi kaydetti',
      },
    },
    user: {
      follow_request: {
        title: 'Takip İsteği',
        body: '{{userFullName}} sizi takip etmek istiyor',
      },
      follow_request_accepted: {
        title: 'Takip İsteği Kabul Edildi',
        body: '{{userFullName}} takip isteğinizi kabul etti',
      },
      new_follower: {
        title: 'Yeni Takipçi',
        body: '{{userFullName}} sizi takip etmeye başladı',
      },
    },
    group: {
      info_changed: {
        title: 'Grup Güncellendi',
        body: '{{groupName}} bilgileri güncellendi',
      },
      join_request: {
        title: 'Gruba Katılma İsteği',
        body: "{{userFullName}}, {{groupName}}'a katılmak istiyor",
      },
      join_request_accepted: {
        title: 'Katılma İsteği Kabul Edildi',
        body: "{{groupName}}'a katılma isteğiniz kabul edildi",
      },
      user_joined: {
        title: 'Yeni Üye',
        body: "{{userFullName}}, {{groupName}}'a katıldı",
      },
      user_left: {
        title: 'Üye Ayrıldı',
        body: "{{userFullName}}, {{groupName}}'dan ayrıldı",
      },
      member_removed: {
        title: 'Üye Çıkarıldı',
        body: "{{userFullName}}, {{adminFullName}} tarafından {{groupName}}'dan çıkarıldı",
      },
      role_changed: {
        title: 'Rol Değişti',
        body: "{{groupName}}'daki rolünüz {{role}} olarak değiştirildi",
      },
    },
    event: {
      invitation: {
        title: 'Etkinlik Daveti',
        body: '{{eventDate}} tarihinde {{eventName}} etkinliğine davetlisiniz',
      },
      invitation_reminder: {
        title: 'Etkinlik Daveti Hatırlatması',
        body: '{{eventDate}} tarihindeki {{eventName}} etkinlik davetine yanıt vermeyi unutmayın',
      },
      reminder: {
        title: 'Etkinlik Hatırlatması',
        body: '{{eventName}} etkinliği {{timeUntil}} başlayacak',
      },
      cancelled: {
        title: 'Etkinlik İptal Edildi',
        body: '{{eventName}} etkinliği iptal edildi',
      },
      updated: {
        title: 'Etkinlik Güncellendi',
        body: '{{eventName}} etkinliği detayları güncellendi',
      },
    },
    emergency: {
      title: 'Acil Durum',
      body: '{{userFullName}} tarafından {{emergencyType}} acil durumu bildirildi.',
    },
    warning: {
      title: 'Uyarı',
      body: '{{userFullName}} yakınlarda {{warningType}} uyarısı bildirdi',
    },
    common: {
      view_details: 'Detayları Görüntüle',
      dismiss: 'Kapat',
      accept: 'Kabul Et',
      reject: 'Reddet',
    },
  },
  enums: {
    warningType: {
      radar: 'Hız Radarı',
      police_checkpoint: 'Polis Kontrol Noktası',
      accident: 'Kaza',
      road_construction: 'Yol Çalışması',
      road_closure: 'Yol Kapalı',
      dangerous_curve: 'Tehlikeli Viraj',
      slippery_road: 'Kaygan Yol',
      parking_prohibited: 'Park Yasağı',
      other: 'Diğer',
    },
    emergencyType: {
      accident: 'Kaza',
      breakdown: 'Arıza',
      medical: 'Tıbbi Acil Durum',
      fuel_shortage: 'Yakıt Bitti',
      tire_problem: 'Lastik Sorunu',
      battery_dead: 'Akü Bitti',
      lost: 'Kayboldum/Mahsur Kaldım',
      other: 'Diğer',
    },
  },
  errors: {
    // Authentication errors
    auth: {
      invalid_authorization_header: 'Geçersiz yetkilendirme başlığı',
      invalid_token: 'Geçersiz token',
      token_expired: 'Token süresi doldu',
      invalid_jwt_token: 'Geçersiz JWT token',
      user_not_found_during_refresh:
        'Token yenileme sırasında kullanıcı bulunamadı',
      invalid_credentials: 'Geçersiz kimlik bilgileri',
      email_already_in_use: 'E-posta zaten kullanımda',
      user_not_created: 'Kullanıcı oluşturulamadı',
      failed_to_send_password_reset_email:
        'Şifre sıfırlama e-postası gönderilemedi',
      failed_to_update_email: 'E-posta güncellenemedi',
      failed_to_update_password: 'Şifre güncellenemedi',
      failed_to_resend_email: 'E-posta yeniden gönderilemedi',
      token_and_password_required: 'Token ve şifre gereklidir',
      password_updated_successfully: 'Şifre başarıyla güncellendi',
      invalid_or_expired_token: 'Geçersiz veya süresi dolmuş token',
    },
    // Common errors
    common: {
      not_found: '{{resource}} bulunamadı',
      not_found_with_id: '{{resource}} ID {{id}} ile bulunamadı',
      forbidden: 'Bu işlemi gerçekleştirmek için yetkiniz yok',
      cannot_perform_action: '{{resource}} işlemini gerçekleştiremezsiniz',
      failed_to_create: '{{resource}} oluşturulamadı',
      failed_to_update: '{{resource}} güncellenemedi',
      failed_to_delete: '{{resource}} silinemedi',
      failed_to_upload: '{{resource}} yüklenemedi',
      failed_to_upload_with_error: '{{resource}} yüklenemedi: {{error}}',
      already_exists: '{{resource}} zaten mevcut',
      cannot_follow_yourself: 'Kendinizi takip edemezsiniz',
      already_following: 'Bu kullanıcıyı zaten takip ediyorsunuz',
      not_following: 'Bu kullanıcıyı takip etmiyorsunuz',
      internal_server_error: 'Sunucu hatası',
      invalid_authentication: 'Geçersiz kimlik doğrulama',
      invalid_token: 'Geçersiz token',
    },
    // Post errors
    post: {
      cannot_delete: 'Yalnızca kendi gönderilerinizi silebilirsiniz',
      cannot_update: 'Yalnızca kendi gönderilerinizi güncelleyebilirsiniz',
    },
    // Post comment errors
    post_comment: {
      cannot_delete: 'Yalnızca kendi yorumlarınızı silebilirsiniz',
      cannot_update: 'Yalnızca kendi yorumlarınızı güncelleyebilirsiniz',
    },
    // Group errors
    group: {
      already_member: 'Kullanıcı zaten bu grubun üyesi',
      cannot_delete: 'Yalnızca sahip olduğunuz grupları silebilirsiniz',
      cannot_update: 'Yalnızca sahip olduğunuz grupları güncelleyebilirsiniz',
    },
    // Group membership errors
    group_membership: {
      cannot_remove_yourself: 'Kendinizi gruptan çıkaramazsınız',
      cannot_remove: 'Bu üyeyi kaldıramazsınız',
      cannot_leave: 'Bu gruptan ayrılamazsınız',
    },
    // Event errors
    event: {
      cannot_remove: 'Bu etkinliği kaldıramazsınız',
      cannot_leave: 'Kendi etkinliğinizden ayrılamazsınız',
      cannot_cancel: 'Bu etkinliği iptal edemezsiniz',
      failed_to_fetch_invitations: 'Davetiyeler alınamadı',
      failed_to_reject_invitation: 'Davetiye reddedilemedi',
      failed_to_accept_invitation: 'Davetiye kabul edilemedi',
    },
    // Warning errors
    warning: {
      cannot_delete: 'Yalnızca kendi uyarılarınızı silebilirsiniz',
    },
    // Emergency errors
    emergency: {
      cannot_delete: 'Yalnızca kendi acil durumlarınızı silebilirsiniz',
    },
    // Business comment errors
    business_comment: {
      rating_invalid: 'Değerlendirme 1 ile 5 arasında olmalıdır',
      cannot_delete: 'Yalnızca kendi yorumlarınızı silebilirsiniz',
      cannot_update: 'Yalnızca kendi yorumlarınızı güncelleyebilirsiniz',
    },
  },
  // Resource names for translation
  resources: {
    email: 'E-posta',
    supabase_credentials: 'Supabase Kimlik Bilgileri',
    authorization_header: 'Yetkilendirme Başlığı',
    user: 'Kullanıcı',
    user_following: 'Kullanıcı Takibi',
    user_setting: 'Kullanıcı Ayarı',
    post: 'Gönderi',
    create_post: 'Gönderi Oluşturma',
    post_comment: 'Gönderi Yorumu',
    create_post_comment: 'Gönderi Yorumu Oluşturma',
    update_post: 'Gönderi Güncelleme',
    group: 'Grup',
    group_membership: 'Grup Üyeliği',
    event: 'Etkinlik',
    event_participant: 'Etkinlik Katılımcısı',
    event_invitation: 'Etkinlik Davetiyesi',
    warning: 'Uyarı',
    emergency: 'Acil Durum',
    business: 'İşletme',
    business_comment: 'İşletme Yorumu',
    city: 'Şehir',
    file: 'Dosya',
    image: 'Resim',
    invitation: 'Davetiye',
    participant: 'Katılımcı',
    membership: 'Üyelik',
    like: 'Beğeni',
    save: 'Kayıt',
  },
};
