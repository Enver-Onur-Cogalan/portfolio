import { test } from 'node:test';
import assert from 'node:assert/strict';
import { containsProfanity } from './profanity.ts';

// Bu testin varlık sebebi: filtrenin ilk sürümü kelime gövdesinde arama
// yaptığı için "hello" (içinde 'hell' geçiyor) engelleniyordu. Yani
// İngilizce konuşan her ziyaretçi selam verdiğinde azarlanıyordu.
// Aşağıdaki listeler o hatanın tekrar etmesini engelliyor.

const MUST_PASS = [
  'hello', 'hello there', 'hi', 'Merhaba', 'selam', 'nasılsın',
  'aşağı kaydır', 'projelerini anlat', 'ne iş yapıyorsun', 'yetenekler',
  'shell script', 'michelle', 'scraping', 'passes', 'class', 'assistant',
  'dumbbell', 'hellenic', 'analysis', 'ananas suyu', 'götür beni',
  'picture', 'country', 'React Native', 'Unimall projesi', 'maliyet',
  'iletişim bilgilerin', 'deneyimlerin neler', 'bootcamp', 'password',
  'Jarvis asistan', 'AI Engineer', 'benchmark', 'aptalca bir hata',
  'Canada', 'assessment',
];

const MUST_BLOCK = [
  'amk', 'a.m.k', 'aq', 'siktir', 'siktir git', 'siktiğim',
  'orospu', 'oç', 'piç', 'yarrak', 'amına koyayım',
  'fuck', 'fucking', 'shit', 'bullshit', 'bitch', 'asshole',
  'motherfucker', 'nigger', 'faggot', 'retarded',
  's1kt1r', '4mk', 'siiiktir', 'şerefsiz', 'pezevenk', 'kahpe',
  'göt', 'mal', 'salak', 'dumbass', 'whore',
];

test('masum ifadeler engellenmiyor', () => {
  for (const phrase of MUST_PASS) {
    assert.equal(containsProfanity(phrase), false, `yanlışlıkla engellendi: ${phrase}`);
  }
});

test('kaba ifadeler yakalanıyor', () => {
  for (const phrase of MUST_BLOCK) {
    assert.equal(containsProfanity(phrase), true, `yakalanamadı: ${phrase}`);
  }
});

test('boş girdi güvenli', () => {
  assert.equal(containsProfanity(''), false);
  assert.equal(containsProfanity('   '), false);
});
