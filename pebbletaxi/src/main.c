#include <pebble.h>

static Window *s_main_window;
static TextLayer *s_output_layer;

static DictationSession *s_dictation_session;
static char s_last_text[256];
static char s_buffer[256];
#define UBER 1
#define CABBIE 2
#define TARGET 3
/******************************* Dictation API ********************************/

static void dictation_session_callback(DictationSession *session, DictationSessionStatus status, 
                                       char *transcription, void *context) {
  if(status == DictationSessionStatusSuccess) {
    // Display the dictated text
    DictionaryIterator *iterator;
    app_message_outbox_begin(&iterator);
    Tuplet tuple = TupletCString(TARGET,transcription);
    dict_write_tuplet(iterator, &tuple);
    dict_write_end(iterator);
    Tuple *data = dict_find(iterator, TARGET);
    app_message_outbox_send();
    snprintf(s_last_text, sizeof(s_buffer), "Received '%s'", data->value->cstring);
     //snprintf(s_last_text, sizeof(s_buffer), "Received '%s'", "my name sucks");
    //snprintf(s_last_text, sizeof(s_last_text), "Transcription:\n\n%s", transcription);
    text_layer_set_text(s_output_layer, s_last_text);
  } else {
    // Display the reason for any error
    static char s_failed_buff[128];
    snprintf(s_failed_buff, sizeof(s_failed_buff), "Transcription failed.\n\nError ID:\n%d", (int)status);
    text_layer_set_text(s_output_layer, s_failed_buff);
  }
}

/************************************ App *************************************/

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  // Start voice dictation UI
  dictation_session_start(s_dictation_session);
}


static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Down Button Pressed");
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Up Button Pressed");

}

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
 // (void) context;
  // Get the first pair
  Tuple *data = dict_read_first(iterator);
  APP_LOG(APP_LOG_LEVEL_ERROR, "message get");
  char uber_buffer[32], cabbie_buffer[32];
  while(data != NULL)
    {
        APP_LOG(APP_LOG_LEVEL_ERROR, "message get");
         int key = data->key;
         char string_value[32];
         strcpy(string_value, data->value->cstring);
         switch(key){
           case UBER:
             strcpy(uber_buffer,string_value);
             APP_LOG(APP_LOG_LEVEL_INFO, string_value);
           case CABBIE:
             strcpy(cabbie_buffer,string_value);
             APP_LOG(APP_LOG_LEVEL_INFO, string_value);
         }
         data = dict_read_next(iterator);
    }
  snprintf(s_last_text, sizeof(s_last_text), "Uber Price:%s \n\n Yellow Cab Price:\n$%s", uber_buffer,cabbie_buffer);
    text_layer_set_text(s_output_layer, s_last_text);
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);

  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_output_layer = text_layer_create(GRect(bounds.origin.x, (bounds.size.h - 24) / 2, bounds.size.w, bounds.size.h));
  text_layer_set_text(s_output_layer, "Press Select to dictate a destination");
  text_layer_set_text_alignment(s_output_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_output_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(s_output_layer);
}

static void init() {
  s_main_window = window_create();
  window_set_click_config_provider(s_main_window, click_config_provider);
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  app_message_open(64, 64);
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(s_main_window, true);

  // Create new dictation session
  s_dictation_session = dictation_session_create(sizeof(s_last_text), dictation_session_callback, NULL);
}

static void deinit() {
  // Free the last session data
  dictation_session_destroy(s_dictation_session);

  window_destroy(s_main_window);
}

int main() {
  init();
  app_event_loop();
  deinit();
}
