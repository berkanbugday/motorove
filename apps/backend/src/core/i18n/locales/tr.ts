export const trTranslations = {
  notifications: {
    system: {
      title: 'Sistem Bildirimi',
      body: 'Sistem güncellemesi mevcut',
    },
    post: {
      shared_in_group: {
        title: "{{groupName}}'da Yeni Gönderi",
        body: "{{userName}}, {{groupName}}'da yeni bir gönderi paylaştı",
      },
      like: {
        title: 'Gönderi Beğenildi',
        body: '{{userName}} gönderinizi beğendi',
      },
      comment: {
        title: 'Yeni Yorum',
        body: '{{userName}} gönderinize yorum yaptı: "{{comment}}"',
      },
      save: {
        title: 'Gönderi Kaydedildi',
        body: '{{userName}} gönderinizi kaydetti',
      },
    },
    user: {
      follow_request: {
        title: 'Takip İsteği',
        body: '{{userName}} sizi takip etmek istiyor',
      },
      follow_request_accepted: {
        title: 'Takip İsteği Kabul Edildi',
        body: '{{userName}} takip isteğinizi kabul etti',
      },
      new_follower: {
        title: 'Yeni Takipçi',
        body: '{{userName}} sizi takip etmeye başladı',
      },
    },
    group: {
      info_changed: {
        title: 'Grup Güncellendi',
        body: '{{groupName}} bilgileri güncellendi',
      },
      join_request: {
        title: 'Gruba Katılma İsteği',
        body: "{{userName}}, {{groupName}}'a katılmak istiyor",
      },
      join_request_accepted: {
        title: 'Katılma İsteği Kabul Edildi',
        body: "{{groupName}}'a katılma isteğiniz kabul edildi",
      },
      user_joined: {
        title: 'Yeni Üye',
        body: "{{userName}}, {{groupName}}'a katıldı",
      },
      user_left: {
        title: 'Üye Ayrıldı',
        body: "{{userName}}, {{groupName}}'dan ayrıldı",
      },
      member_removed: {
        title: 'Üye Çıkarıldı',
        body: "{{userName}}, {{groupName}}'dan çıkarıldı",
      },
      role_changed: {
        title: 'Rol Değişti',
        body: "{{userName}}'in {{groupName}}'daki rolü {{role}} olarak değiştirildi",
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
    route: {
      shared: {
        title: 'Yeni Rota Paylaşıldı',
        body: '{{userName}} yeni bir rota paylaştı: {{routeName}}',
      },
      liked: {
        title: 'Rota Beğenildi',
        body: '{{userName}} rotanızı beğendi: {{routeName}}',
      },
    },
    emergency: {
      title: 'Acil Durum',
      body: '{{fullName}} tarafından {{emergencyType}} acil durumu bildirildi.',
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
};
